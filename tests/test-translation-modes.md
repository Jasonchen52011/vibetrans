# Translation Modes Test Cases

## Test Setup
- URL: http://localhost:3001/chinese-to-english-translator
- Test Date: 2025-10-13

## Test Cases

### ✅ Test 1: General Mode (Default)
**Input**: `今天天气很好`
**Expected Output**: Natural, everyday translation
**Example**: "The weather is nice today"

### ✅ Test 2: Technical Mode
**Input**: `该算法的时间复杂度为O(n log n)`
**Expected Output**: Technical terminology with precision
**Example**: "The time complexity of this algorithm is O(n log n)"

### ✅ Test 3: Legal Mode
**Input**: `甲方应在合同签订后30日内支付首期款项`
**Expected Output**: Formal legal language
**Example**: "Party A shall pay the initial installment within 30 days following the execution of this Contract"

### ✅ Test 4: Literary Mode
**Input**: `明月几时有,把酒问青天`
**Expected Output**: Poetic, preserving artistic style
**Example**: "When will the bright moon rise? I lift my cup to ask the azure sky"

### ✅ Test 5: Idioms & Slang Mode
**Input**: `加油!你一定行!`
**Expected Output**: Explanation of idiom + contextual translation
**Example**:
- Literal: "Add oil! You definitely can!"
- Contextual: "Go for it! You can do it!"
- Explanation: "加油 (jiāyóu) is a Chinese idiom literally meaning 'add oil', used as encouragement similar to 'go for it' or 'you got this' in English."

## UI Verification

### Mode Selector
- [x] Mode selector appears at the top of the tool
- [x] Default mode is "General"
- [x] 5 modes available: General, Technical, Legal, Literary, Idioms & Slang
- [x] Each mode shows description on hover/select
- [x] Selected mode is highlighted

### API Integration
- [x] `mode` parameter sent to API
- [x] `inputType: 'text'` sent to API
- [x] Response contains translated text
- [x] Error handling for invalid modes

### Responsive Design
- [x] Mode selector works on mobile
- [x] Descriptions readable on small screens
- [x] No layout issues

## Expected API Request
```json
{
  "text": "今天天气很好",
  "direction": "zh-to-en",
  "mode": "general",
  "inputType": "text"
}
```

## Expected API Response
```json
{
  "translated": "The weather is nice today",
  "original": "今天天气很好",
  "mode": "general",
  "modeName": "General Translation",
  "direction": "zh-to-en",
  "inputType": "text",
  "message": "Translation successful"
}
```

## Manual Testing Steps

1. **Open page**: Navigate to http://localhost:3001/chinese-to-english-translator
2. **Verify UI**: Check that mode selector appears with 5 options
3. **Test each mode**:
   - Select "General" → Input test text → Click Translate
   - Verify output style matches mode description
   - Repeat for Technical, Legal, Literary, Idioms
4. **Test mode switching**: Change mode mid-session and verify it applies to new translations
5. **Test with file upload**: Upload .txt file with Chinese text, verify mode still applies
6. **Test bidirectional**: Switch to EN→ZH, verify modes work in reverse

## Success Criteria
- ✅ All 5 translation modes work correctly
- ✅ Mode selector UI is intuitive and accessible
- ✅ Each mode produces noticeably different translation styles
- ✅ Idioms mode provides cultural explanations
- ✅ Technical mode uses proper terminology
- ✅ Legal mode maintains formality
- ✅ Literary mode preserves artistic expression
- ✅ No console errors or API failures
