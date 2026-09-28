package com.starlight.azeroth_solo

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import com.google.mediapipe.tasks.genai.llminference.LlmInference
import com.google.mediapipe.tasks.genai.llminference.LlmInferenceSession
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import android.provider.Settings
import androidx.core.content.FileProvider
import java.util.concurrent.Executors

// On-device text generation for the optional AI chat pack.
// The game (JS in the WebView) talks to Dart, Dart talks to this channel.
// All model work runs on one background thread so the UI never blocks.
class MainActivity : FlutterActivity() {
    private val worker = Executors.newSingleThreadExecutor()
    private var llm: LlmInference? = null
    private var pendingImport: MethodChannel.Result? = null
    private val importRequest = 4711

    private fun modelFile(): File = File(filesDir, "models/azsolo-chat.task")

    // ---- in-app updater (v9.3): downloads a release APK from this game's GitHub repo and opens the installer
    private val updWorker = Executors.newSingleThreadExecutor()
    @Volatile private var updState = "idle"; @Volatile private var updDone = 0L; @Volatile private var updTotal = 0L; @Volatile private var updError: String? = null
    private fun updFile(): File = File(File(cacheDir, "updates").apply { mkdirs() }, "AzerothSolo-update.apk")
    private val updPrefix = "https://github.com/faizal97/azeroth-solo/releases/download/"
    private fun startDownload(url: String) {
        updState = "running"; updDone = 0; updTotal = 0; updError = null
        updWorker.execute {
            try {
                var u = URL(url); var conn: HttpURLConnection
                var hops = 0
                while (true) { // follow GitHub's redirect to its asset host
                    conn = u.openConnection() as HttpURLConnection
                    conn.instanceFollowRedirects = false; conn.connectTimeout = 15000; conn.readTimeout = 30000
                    val code = conn.responseCode
                    if (code in 300..399 && hops++ < 5) { u = URL(u, conn.getHeaderField("Location")); conn.disconnect(); continue }
                    if (code != 200) throw Exception("HTTP $code")
                    break
                }
                updTotal = conn.contentLengthLong
                val tmp = File(updFile().path + ".part")
                conn.inputStream.use { input -> tmp.outputStream().use { out ->
                    val buf = ByteArray(64 * 1024)
                    while (true) { val n = input.read(buf); if (n < 0) break; out.write(buf, 0, n); updDone += n }
                } }
                if (updTotal > 0 && updDone != updTotal) throw Exception("download incomplete")
                updFile().delete(); tmp.renameTo(updFile())
                updState = "done"
            } catch (e: Exception) { updError = e.message ?: e.toString(); updState = "error" }
        }
    }
    private fun canInstall(): Boolean = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls()

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "azsolo/update").setMethodCallHandler { call, result ->
            when (call.method) {
                "appVersion" -> {
                    val pi = packageManager.getPackageInfo(packageName, 0)
                    result.success(mapOf("name" to pi.versionName, "code" to (if (Build.VERSION.SDK_INT >= 28) pi.longVersionCode else @Suppress("DEPRECATION") pi.versionCode.toLong())))
                }
                "download" -> {
                    val url = call.argument<String>("url") ?: ""
                    if (!url.startsWith(updPrefix) || !url.endsWith(".apk")) { result.error("bad_url", "Only this game's GitHub release APKs can be downloaded", null); return@setMethodCallHandler }
                    if (updState == "running") { result.success(true); return@setMethodCallHandler }
                    startDownload(url); result.success(true)
                }
                "progress" -> result.success(mapOf("state" to updState, "done" to updDone, "total" to updTotal, "error" to updError))
                "canInstall" -> result.success(canInstall())
                "askInstallPermission" -> {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:$packageName")))
                    result.success(true)
                }
                "install" -> {
                    val f = updFile()
                    if (!f.exists()) { result.error("missing", "The update has not been downloaded", null); return@setMethodCallHandler }
                    if (!canInstall()) { result.error("need_permission", "Allow Azeroth Solo to install apps first", null); return@setMethodCallHandler }
                    val uri = FileProvider.getUriForFile(this, "$packageName.updates", f)
                    startActivity(Intent(Intent.ACTION_VIEW).apply { setDataAndType(uri, "application/vnd.android.package-archive"); addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK) })
                    result.success(true)
                }
                "openUrl" -> {
                    val url = call.argument<String>("url") ?: ""
                    if (url.startsWith("https://github.com/faizal97/azeroth-solo")) startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "azsolo/ai").setMethodCallHandler { call, result ->
            when (call.method) {
                "device" -> result.success(deviceInfo())
                "model" -> {
                    val f = modelFile()
                    result.success(if (f.exists()) mapOf("path" to f.absolutePath, "bytes" to f.length(), "loaded" to (llm != null)) else null)
                }
                "importModel" -> {
                    if (pendingImport != null) { result.error("busy", "An import is already running", null); return@setMethodCallHandler }
                    pendingImport = result
                    val pick = Intent(Intent.ACTION_OPEN_DOCUMENT).apply { addCategory(Intent.CATEGORY_OPENABLE); type = "*/*" }
                    startActivityForResult(pick, importRequest)
                }
                "deleteModel" -> worker.execute {
                    llm?.close(); llm = null
                    val ok = modelFile().delete()
                    runOnUiThread { result.success(ok) }
                }
                "load" -> {
                    val maxTokens = call.argument<Int>("maxTokens") ?: 768
                    worker.execute {
                        try {
                            llm?.close()
                            val opts = LlmInference.LlmInferenceOptions.builder()
                                .setModelPath(modelFile().absolutePath)
                                .setMaxTokens(maxTokens)
                                .setMaxTopK(40)
                                .build()
                            llm = LlmInference.createFromOptions(this, opts)
                            runOnUiThread { result.success(true) }
                        } catch (e: Throwable) {
                            llm = null
                            runOnUiThread { result.error("load", e.message ?: e.toString(), null) }
                        }
                    }
                }
                "unload" -> worker.execute { llm?.close(); llm = null; runOnUiThread { result.success(true) } }
                "generate" -> {
                    val prompt = call.argument<String>("prompt") ?: ""
                    val temperature = (call.argument<Double>("temperature") ?: 0.9).toFloat()
                    worker.execute {
                        val model = llm
                        if (model == null) { runOnUiThread { result.error("not_loaded", "Model not loaded", null) }; return@execute }
                        try {
                            val t0 = System.currentTimeMillis()
                            val sessionOpts = LlmInferenceSession.LlmInferenceSessionOptions.builder()
                                .setTopK(40)
                                .setTemperature(temperature)
                                .build()
                            val session = LlmInferenceSession.createFromOptions(model, sessionOpts)
                            session.addQueryChunk(prompt)
                            val text = session.generateResponse()
                            session.close()
                            val ms = System.currentTimeMillis() - t0
                            runOnUiThread { result.success(mapOf("text" to text, "ms" to ms)) }
                        } catch (e: Throwable) {
                            runOnUiThread { result.error("generate", e.message ?: e.toString(), null) }
                        }
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    // Copy the picked file into app storage (models are hundreds of MB, so this runs off the UI thread).
    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != importRequest) return
        val res = pendingImport ?: return
        pendingImport = null
        val uri: Uri? = data?.data
        if (resultCode != Activity.RESULT_OK || uri == null) { res.success(null); return }
        worker.execute {
            try {
                llm?.close(); llm = null
                val dst = modelFile(); dst.parentFile?.mkdirs()
                val tmp = File(dst.parentFile, "incoming.tmp")
                contentResolver.openInputStream(uri).use { input ->
                    tmp.outputStream().use { out -> input!!.copyTo(out, 1 shl 20) }
                }
                if (dst.exists()) dst.delete()
                tmp.renameTo(dst)
                runOnUiThread { res.success(mapOf("path" to dst.absolutePath, "bytes" to dst.length())) }
            } catch (e: Throwable) {
                runOnUiThread { res.error("import", e.message ?: e.toString(), null) }
            }
        }
    }

    // What the game needs to pick a model and respect the battery guards.
    private fun deviceInfo(): Map<String, Any> {
        val am = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val mem = ActivityManager.MemoryInfo(); am.getMemoryInfo(mem)
        val battery = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = battery?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = battery?.getIntExtra(BatteryManager.EXTRA_SCALE, 100) ?: 100
        val status = battery?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val charging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        val thermal = if (Build.VERSION.SDK_INT >= 29) pm.currentThermalStatus else 0
        return mapOf(
            "ramMB" to (mem.totalMem / (1024 * 1024)),
            "availMB" to (mem.availMem / (1024 * 1024)),
            "lowMemory" to mem.lowMemory,
            "battery" to (if (level >= 0 && scale > 0) level * 100 / scale else -1),
            "charging" to charging,
            "powerSave" to pm.isPowerSaveMode,
            "thermal" to thermal,
            "model" to "${Build.MANUFACTURER} ${Build.MODEL}",
            "sdk" to Build.VERSION.SDK_INT,
        )
    }
}
