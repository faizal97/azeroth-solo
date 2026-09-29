import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  runApp(const AzerothApp());
}

class AzerothApp extends StatelessWidget {
  const AzerothApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      title: 'Realm of Loner',
      debugShowCheckedModeBanner: false,
      home: GameScreen(),
    );
  }
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> with WidgetsBindingObserver {
  late final WebViewController _controller;
  // Bridges to MainActivity.kt. The page sends {id, cmd, args} on a JS channel; the answer goes back to window.<reply>.
  static const _upd = MethodChannel('azsolo/update'); // in-app updater, answered with window.AZUPD_REPLY
  static const _file = MethodChannel('azsolo/file');  // save files: share sheet and file picker, window.AZFILE_REPLY
  static const _cloud = MethodChannel('azsolo/cloud'); // cloud save: a Google Drive token, window.AZCLOUD_REPLY
  Future<void> _bridge(MethodChannel ch, String reply, JavaScriptMessage msg) async {
    Map<String, dynamic> req;
    try { req = jsonDecode(msg.message) as Map<String, dynamic>; } catch (_) { return; }
    final id = req['id'];
    bool ok = true;
    Object? value;
    try {
      value = await ch.invokeMethod(req['cmd'] as String, req['args']);
    } on PlatformException catch (e) {
      ok = false; value = {'code': e.code, 'message': e.message};
    } catch (e) {
      ok = false; value = {'code': 'error', 'message': e.toString()};
    }
    final payload = jsonEncode({'id': id, 'ok': ok, 'value': value});
    _controller.runJavaScript('window.$reply && window.$reply(${jsonEncode(payload)})');
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E0B08))
      ..addJavaScriptChannel('AzUpd', onMessageReceived: (m) => _bridge(_upd, 'AZUPD_REPLY', m))
      ..addJavaScriptChannel('AzFile', onMessageReceived: (m) => _bridge(_file, 'AZFILE_REPLY', m))
      ..addJavaScriptChannel('AzCloud', onMessageReceived: (m) => _bridge(_cloud, 'AZCLOUD_REPLY', m))
      ..loadFlutterAsset('assets/game/index.html');
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Tell the page to save whenever the app goes to the background, so a
  // swipe-away never loses progress.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _controller.runJavaScript('window.GAME && window.GAME.save && window.GAME.save()');
    } else if (state == AppLifecycleState.resumed) {
      _controller.runJavaScript('window.GAME && window.GAME.resume && window.GAME.resume()');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _controller.runJavaScript('window.GAME && window.GAME.back && window.GAME.back()');
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0E0B08),
        body: SafeArea(child: WebViewWidget(controller: _controller)),
      ),
    );
  }
}
