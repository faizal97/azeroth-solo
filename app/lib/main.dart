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
      title: 'Azeroth Solo',
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
  // Bridge to the native on-device model (MainActivity.kt).
  static const _ai = MethodChannel('azsolo/ai');

  // The page sends {id, cmd, args}; we answer with window.AZAI_REPLY(id, ok, value).
  Future<void> _onAiMessage(JavaScriptMessage msg) async {
    Map<String, dynamic> req;
    try { req = jsonDecode(msg.message) as Map<String, dynamic>; } catch (_) { return; }
    final id = req['id'];
    bool ok = true;
    Object? value;
    try {
      value = await _ai.invokeMethod(req['cmd'] as String, req['args']);
    } on PlatformException catch (e) {
      ok = false; value = {'code': e.code, 'message': e.message};
    } catch (e) {
      ok = false; value = {'code': 'error', 'message': e.toString()};
    }
    final payload = jsonEncode({'id': id, 'ok': ok, 'value': value});
    _controller.runJavaScript('window.AZAI_REPLY && window.AZAI_REPLY(${jsonEncode(payload)})');
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E0B08))
      ..addJavaScriptChannel('AzAI', onMessageReceived: _onAiMessage)
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
