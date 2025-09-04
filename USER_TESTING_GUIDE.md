# 🧪 **USER TESTING GUIDE - Step by Step**

## 🚀 **PRE-TEST SETUP (30 seconds)**

### **Step 1: Verify Servers are Running**
```bash
# Check if both servers are running:
1. Open Task Manager (Ctrl + Shift + Esc)
2. Look for "node.exe" processes (should see 2-3)
3. Or check in browser:
   - Frontend: http://localhost:5173 (should load)
   - Backend: http://localhost:3001/health (should show JSON)
```

### **Step 2: Open the IDE**
```bash
1. Open browser (Chrome/Edge recommended)
2. Navigate to: http://localhost:5173
3. Wait for IDE to load (should see VS Code-like interface)
```

---

## 🧩 **TEST 1: BASIC INTERFACE (2 minutes)**

### **✅ What You Should See:**
- [ ] **Left Panel**: Activity Bar with icons (Files, Search, Git, Debug)
- [ ] **Main Area**: Monaco Editor with welcome screen
- [ ] **File Explorer**: Should show "sample.js" and "README.md" from backend
- [ ] **Status Bar**: Bottom bar with file info
- [ ] **No Console Errors**: Press F12 → Console tab should be mostly clean

### **🔍 Actions to Test:**
1. **Click Activity Bar Icons**: Files, Search, Git, Debug
2. **Check File Explorer**: Should show files from backend storage
3. **Open Browser Console** (F12): Look for successful API calls

### **✅ Expected Results:**
- Interface loads smoothly
- File tree shows backend files
- No critical errors in console
- All panels switch correctly

---

## 📁 **TEST 2: FILE OPERATIONS (5 minutes)**

### **Test 2A: View Existing Files**
```bash
✅ Actions:
1. In File Explorer, click on "sample.js"
2. Click on "README.md"

✅ Expected Results:
- Files open in Monaco Editor
- Content loads from backend
- Tabs appear at top of editor
- File content is readable
```

### **Test 2B: Create New File**
```bash
✅ Actions:
1. Right-click in File Explorer (empty space)
2. Select "New File" from context menu
3. Type filename: "test.js"
4. Press Enter

✅ Expected Results:
- New file appears in file tree
- File opens automatically in editor
- Tab shows "test.js"
- Backend receives the file (check console for success message)
```

### **Test 2C: Create New Folder**
```bash
✅ Actions:
1. Right-click in File Explorer
2. Select "New Folder"
3. Type folder name: "components"
4. Press Enter

✅ Expected Results:
- New folder appears in file tree
- Folder can be expanded/collapsed
- Folder structure saved to backend
```

### **Test 2D: Delete File**
```bash
✅ Actions:
1. Right-click on a file (not sample.js - keep that)
2. Select "Delete" from context menu
3. Confirm deletion in popup

✅ Expected Results:
- File disappears from file tree immediately
- File is deleted from backend storage
- No errors in console
```

---

## 💾 **TEST 3: AUTO-SAVE FUNCTIONALITY (3 minutes)**

### **Test 3A: Edit and Auto-Save**
```bash
✅ Actions:
1. Open "sample.js" file
2. Start typing: console.log("Hello World!")
3. Watch the tab bar for save status
4. Wait 2-3 seconds after stopping typing

✅ Expected Results:
- Save indicator appears (spinning icon or "saving...")
- After 2 seconds, shows "✓" (saved)
- No errors in console
- Changes persist when switching tabs
```

### **Test 3B: Multiple File Editing**
```bash
✅ Actions:
1. Open "sample.js" and "README.md"
2. Edit content in both files
3. Switch between tabs while editing
4. Check save status for each file

✅ Expected Results:
- Each file saves independently
- Save status shows correctly for active tab
- Content persists when switching tabs
- All changes saved to backend
```

### **Test 3C: Error Handling**
```bash
✅ Actions:
1. Edit a file
2. Stop the backend server (Ctrl+C in backend terminal)
3. Continue editing
4. Watch for save status changes

✅ Expected Results:
- Save status shows error indicator (⚠)
- User can still edit (graceful degradation)
- When backend restarts, saving resumes
```

---

## 🔍 **TEST 4: SEARCH FUNCTIONALITY (2 minutes)**

### **Test 4A: File Search**
```bash
✅ Actions:
1. Click "Search" icon in Activity Bar
2. Type search term: "console"
3. Check if it finds content in files

✅ Expected Results:
- Search panel opens
- Shows search results from files
- Can navigate to search results
```

### **Test 4B: File Explorer Search**
```bash
✅ Actions:
1. Click "Files" icon in Activity Bar
2. Use search box in File Explorer
3. Type part of a filename

✅ Expected Results:
- File tree filters to matching files
- Search results highlighted
- Can clear search to show all files
```

---

## 🔄 **TEST 5: GIT INTEGRATION (2 minutes)**

### **Test 5A: Git Panel**
```bash
✅ Actions:
1. Click "Git" icon in Activity Bar
2. Check the Git panel content
3. Look for file change indicators

✅ Expected Results:
- Git panel shows current status
- Lists changed files (if any)
- Shows staging area
- Branch information visible
```

---

## 🐛 **TEST 6: ERROR HANDLING (3 minutes)**

### **Test 6A: Network Issues**
```bash
✅ Actions:
1. Stop backend server
2. Try creating a new file
3. Try saving a file
4. Restart backend server

✅ Expected Results:
- Clear error messages (not cryptic)
- IDE doesn't crash
- Operations resume when backend returns
- Graceful offline mode
```

### **Test 6B: Invalid Operations**
```bash
✅ Actions:
1. Try creating file with invalid name ("file<>.js")
2. Try deleting non-existent file
3. Try operations on locked files

✅ Expected Results:
- Helpful error messages
- No browser crashes
- User can retry operations
```

---

## 📱 **TEST 7: RESPONSIVENESS (2 minutes)**

### **Test 7A: Window Resizing**
```bash
✅ Actions:
1. Resize browser window (make smaller/larger)
2. Check if panels adapt
3. Try different screen sizes

✅ Expected Results:
- UI adapts to window size
- No broken layouts
- All panels remain functional
```

### **Test 7B: Panel Resizing**
```bash
✅ Actions:
1. Drag panel borders to resize
2. Collapse/expand side panels
3. Test different panel configurations

✅ Expected Results:
- Smooth resizing
- Panels remember sizes
- No layout breaking
```

---

## 🎯 **SUCCESS CHECKLIST**

### **✅ Core Functionality Working:**
- [ ] IDE loads without errors
- [ ] File tree shows backend files
- [ ] Can create new files/folders
- [ ] Can delete files/folders
- [ ] Auto-save works (2-second delay)
- [ ] Save status indicator works
- [ ] Multiple files can be edited
- [ ] Panel switching works
- [ ] Search functionality works

### **✅ Professional Features:**
- [ ] VS Code-like interface
- [ ] Responsive design
- [ ] Error handling
- [ ] Visual feedback
- [ ] Keyboard shortcuts work
- [ ] Context menus work

### **✅ Backend Integration:**
- [ ] File operations sync to backend
- [ ] Real-time collaboration ready
- [ ] API endpoints responding
- [ ] Error recovery works

---

## 🚨 **IF SOMETHING FAILS**

### **Common Issues & Quick Fixes:**

**1. "Cannot connect to backend"**
```bash
Solution: Check if backend is running on port 3001
Command: netstat -an | findstr 3001
```

**2. "Files not loading"**
```bash
Solution: Check backend storage folder exists
Path: backend/storage/projects/default/
```

**3. "Auto-save not working"**
```bash
Solution: Check browser console for API errors
Look for: POST /api/v2/files/save requests
```

**4. "File operations fail"**
```bash
Solution: Check CORS settings
Look for: 404 or 500 errors in Network tab
```

---

## 📊 **TESTING REPORT TEMPLATE**

**Copy this and fill out as you test:**

```
✅ PASSED / ❌ FAILED - Basic Interface Loading
✅ PASSED / ❌ FAILED - File Tree Shows Backend Files  
✅ PASSED / ❌ FAILED - Create New File
✅ PASSED / ❌ FAILED - Delete File
✅ PASSED / ❌ FAILED - Auto-Save (2 seconds)
✅ PASSED / ❌ FAILED - Save Status Indicator
✅ PASSED / ❌ FAILED - Multiple File Editing
✅ PASSED / ❌ FAILED - Panel Switching
✅ PASSED / ❌ FAILED - Search Functionality
✅ PASSED / ❌ FAILED - Error Handling

NOTES:
- Any specific errors: 
- Performance issues:
- UI/UX feedback:
- Missing features:
```

---

## 🎉 **BONUS TESTS (If Everything Works)**

1. **Collaboration Test**: Open IDE in 2 browser tabs, edit same file
2. **Performance Test**: Create 10+ files, check responsiveness  
3. **Stress Test**: Rapid file operations, check stability
4. **Mobile Test**: Try on mobile browser (if available)

---

**Ready to start testing! Begin with Test 1 and work through systematically. Report back any issues you find!** 🚀
