import os
import re

# 1. Get the directory where THIS script is running (root/tools)
script_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Go up one level to 'root', then down into 'graphics/battery'
target_dir = os.path.abspath(os.path.join(script_dir, '..', 'graphics', 'battery'))

# Regex: captures everything up to the last underscore followed by numbers
pattern = re.compile(r"^(.*)_\d+$")
unique_names = set()

if os.path.exists(target_dir):
    for filename in os.listdir(target_dir):
        if os.path.isfile(os.path.join(target_dir, filename)):
            # Remove extension (.png, .jpg, etc.)
            name_without_ext, _ = os.path.splitext(filename)
            
            match = pattern.match(name_without_ext)
            if match:
                # Keep everything before the last _
                clean_name = match.group(1)
                unique_names.add(clean_name)

    print(f"Scanning folder: {target_dir}\n")
    print("--- Unique Base Names Found ---")
    for name in sorted(unique_names):
        print(name)
        
    # Print the total count at the end
    print("-------------------------------")
    print(f"Total Unique Count: {len(unique_names)}")
    
else:
    print(f"Error: Could not find the folder at:\n{target_dir}")
    print("Make sure the script is inside 'root/tools' and your graphics are in 'root/graphics/battery'")