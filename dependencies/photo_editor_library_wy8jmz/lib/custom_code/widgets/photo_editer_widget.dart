// Automatic FlutterFlow imports
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:flutter/services.dart';

import 'package:image_editor_plus/image_editor_plus.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:ui' as ui;

class PhotoEditerWidget extends StatefulWidget {
  PhotoEditerWidget({
    super.key,
    this.width,
    this.height,
  });

  final double? width;
  final double? height;

  @override
  State<PhotoEditerWidget> createState() => _PhotoEditerWidgetState();
}

class _PhotoEditerWidgetState extends State<PhotoEditerWidget> {
  Uint8List? imageData;

  @override
  void initState() {
    super.initState();
    // Initialize the collection reference
  }

  Future<void> loadImage() async {
    final pickedImage =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    // getImage(source: ImageSource.gallery);
    if (pickedImage != null) {
      final imageBytes = await pickedImage.readAsBytes();
      setState(() {
        imageData = Uint8List.fromList(imageBytes);
      });
    }
  }

  Future<void> uploadImage() async {
    if (imageData == null) return;

    try {
      final ui.Codec codec = await ui.instantiateImageCodec(imageData!);
      final ui.FrameInfo frameInfo = await codec.getNextFrame();
      final ui.Image image = frameInfo.image;

      // Convert the ui.Image object back to raw data (PNG format)
      final ByteData? byteData =
          await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) {
        throw Exception("Failed to convert image to PNG format");
      }
      final Uint8List pngBytes = byteData.buffer.asUint8List();

      Navigator.of(context).pop();
    } catch (e) {
      Navigator.of(context).pop();

      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text("Error"),
            content: Text("Failed to upload image: $e"),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text("Close"),
              ),
            ],
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (imageData != null)
            Stack(
              alignment: Alignment.topRight,
              children: [
                Image.memory(
                  imageData!,
                  height: 310,
                  fit: BoxFit.cover,
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0, 8, 6, 0),
                  child: InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      ////////////////////////
                      final editedImage = await Navigator.push<Uint8List?>(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ImageEditor(
                            image: imageData,
                          ),
                        ),
                      );

                      // replace with edited image
                      if (editedImage != null) {
                        setState(() {
                          imageData = editedImage;
                        });
                      }
                    },
                    child: Container(
                        width: 35,
                        height: 35,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              FlutterFlowTheme.of(context).primary,
                              FlutterFlowTheme.of(context).secondary
                            ],
                            stops: [0, 1],
                            begin: AlignmentDirectional(1, 0.5),
                            end: AlignmentDirectional(-1, -0.5),
                          ),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: FlutterFlowTheme.of(context).secondary,
                          ),
                        ),
                        alignment: AlignmentDirectional(0, 0),
                        child: Icon(
                          Icons.edit,
                          color: Colors.white,
                          size: 20,
                        )),
                  ),
                ),
              ],
            ),
          const SizedBox(height: 12),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(20, 20, 20, 10),
            child: InkWell(
              onTap: () {
                loadImage();
              },
              child: Container(
                width: double.infinity,
                height: 38,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      FlutterFlowTheme.of(context).primary,
                      FlutterFlowTheme.of(context).secondary
                    ],
                    stops: [0, 1],
                    begin: AlignmentDirectional(1, 0.5),
                    end: AlignmentDirectional(-1, -0.5),
                  ),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: FlutterFlowTheme.of(context).secondary,
                  ),
                ),
                alignment: AlignmentDirectional(0, 0),
                child: Text(
                  'Select Photo',
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        fontFamily: 'Gilmer',
                        color: Colors.white,
                        letterSpacing: 0,
                        useGoogleFonts: false,
                      ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void erorrMessage(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            "Information",
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
          ),
          content: Text(
            message,
            style: TextStyle(fontSize: 14),
          ),
        );
      },
      barrierDismissible: true,
    );
  }
}
