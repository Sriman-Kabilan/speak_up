import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/services_providers.dart';

class DeviceConnectionScreen extends ConsumerStatefulWidget {
  const DeviceConnectionScreen({super.key});

  @override
  ConsumerState<DeviceConnectionScreen> createState() => _DeviceConnectionScreenState();
}

class _DeviceConnectionScreenState extends ConsumerState<DeviceConnectionScreen> {
  bool _connected = false;
  bool _loading = false;

  Future<void> _toggleConnection() async {
    setState(() => _loading = true);
    final service = ref.read(deviceServiceProvider);
    if (_connected) {
      await service.disconnect();
      setState(() {
        _connected = false;
        _loading = false;
      });
    } else {
      final status = await service.connect();
      setState(() {
        _connected = status;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Card(
        margin: const EdgeInsets.all(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_connected ? Icons.usb_rounded : Icons.usb_off_rounded, size: 48),
              const SizedBox(height: 8),
              Text(_connected ? 'Device connected (simulated)' : 'No device connected'),
              const SizedBox(height: 12),
              FilledButton(
                onPressed: _loading ? null : _toggleConnection,
                child: Text(_connected ? 'Disconnect' : 'Connect Device'),
              ),
              const SizedBox(height: 8),
              const Text('Prepared for future hardware audio-stream integration.'),
            ],
          ),
        ),
      ),
    );
  }
}
