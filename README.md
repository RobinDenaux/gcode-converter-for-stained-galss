# What is this tool ?
This tool is designed to <b>adapt gcode files for a CNC with a glass cutting wheel</b> where the wheel is off axis and cannot make sharp angles.<br/>
A small area is sacrificed to allow the wheel to rotate between cuts.

# The intended workflow
- Draw your pattern in inkscape.<br/>
- Use pathOps extension to remove overlapping paths.<br/>
- You may want to use Path &gt; Inset to create a small gap between the pieces.<br/>
- Export the selected pieces using the GcodeTools extension.<br/>
- Drop the generated file into this tool.<br/>

# Getting started
Drag and drop a gcode file into the tool (a .ngc file if using inkscape). The tool will then transform the gcode and display the result.<br/>
If you drop multiple files, they'll all be transformed with the current settings and saved directly.

# Privacy
This tool works offline, in your browser. <b>Your files are not uploaded</b> to a server. There is no tracking, no cookies.

# License
This code is distributed under the MIT license.