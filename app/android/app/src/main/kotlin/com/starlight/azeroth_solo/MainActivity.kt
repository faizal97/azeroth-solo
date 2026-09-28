package com.starlight.azeroth_solo

import android.content.Intent
import android.net.Uri
import android.os.Build
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import android.provider.Settings
import androidx.core.content.FileProvider
import java.util.concurrent.Executors

// The Flutter host for the game. The game (JS in the WebView) talks to Dart, Dart talks to these channels.
class MainActivity : FlutterActivity() {
    // v9.6.1 removed the optional AI chat pack; free the model file an older version may have copied in (hundreds of MB)
    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        super.onCreate(savedInstanceState)
        Executors.newSingleThreadExecutor().execute { try { File(filesDir, "models").deleteRecursively() } catch (_: Exception) {} }
    }

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
    }
}
