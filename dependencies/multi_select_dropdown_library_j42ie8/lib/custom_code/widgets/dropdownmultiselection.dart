// Automatic FlutterFlow imports
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:multi_dropdown/multiselect_dropdown.dart';

class Dropdownmultiselection extends StatefulWidget {
  const Dropdownmultiselection({
    super.key,
    this.width,
    this.height,
    required this.cityListString,
  });

  final double? width;
  final double? height;
  final List<String> cityListString;

  @override
  State<Dropdownmultiselection> createState() => _DropdownmultiselectionState();
}

class _DropdownmultiselectionState extends State<Dropdownmultiselection> {
  List<String> _selectedItems = [];

  @override
  Widget build(BuildContext context) {
    return Container(
      child: MultiSelectDropDown(
        fieldBackgroundColor: Colors.white,
        clearIcon: Icon(
          Icons.clear,
        ),
        hint: "Select Category",
        searchEnabled: true,
        searchLabel: "Search Category",
        selectedOptionTextColor: Colors.grey,
        hintStyle: TextStyle(
          color: Colors.black,
        ),
        selectionType: SelectionType.multi,
        maxItems: widget.cityListString.length,
        optionTextStyle: TextStyle(
          color: Colors.black,
          fontSize: 16,
        ),
        chipConfig: const ChipConfig(
          wrapType: WrapType.scroll,
        ),
        onOptionSelected: (List<ValueItem<dynamic>> selectedOptions) {
          setState(() {
            _selectedItems =
                selectedOptions.map((item) => item.label.toString()).toList();
          });
        },
        options: widget.cityListString.map((city) {
          return ValueItem<String>(
            label: city.toString(),
            value: city.toString(),
          );
        }).toList(),
      ),
    );
  }
}
