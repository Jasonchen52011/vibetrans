/**
 * 智能语言检测工具
 * 用于检测用户输入的文本语言，自动确定翻译方向
 */

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  suggestedDirection: 'to-english' | 'from-english' | 'toAramaic' | 'toEnglish';
  originalDirection?: string;
}

/**
 * 智能语言检测函数 - 优化版
 * 基于字符集、词汇模式、语法特征的综合检测
 */
export function detectLanguage(
  text: string,
  targetLanguage: string
): LanguageDetectionResult {
  const cleanText = text.toLowerCase().trim();

  if (!cleanText) {
    return {
      detectedLanguage: 'unknown',
      confidence: 0,
      suggestedDirection: 'to-english',
    };
  }

  // 检测英语的增强模式
  const englishPatterns = [
    // 高频英语词汇
    /\b(the|be|to|of|and|a|in|that|have|it|for|not|on|with|he|as|you|do|at|this|but|his|by|from|they|we|say|her|she|or|an|will|my|one|all|would|there|their|what|so|up|out|if|about|who|get|which|go|me|when|make|can|like|time|no|just|him|know|take|people|into|year|your|good|some|could|them|see|other|than|then|now|look|only|come|its|over|think|also|back|after|use|two|how|our|work|first|well|way|even|new|want|because|any|these|give|day|most|us)\b/i,
    // 常见英语问候和表达
    /\b(hello|hi|hey|goodbye|bye|thanks|thank you|please|yes|no|sorry|excuse me|good morning|good night|how are you|what's up|nice to meet you)\b/i,
    // 英语语法特征
    /\b(\w+ed|\w+ing|\w+s|'s|'re|'ll|'ve|n't)\b/i,
    // 英语疑问句特征
    /^(what|where|when|why|how|who|which|whose|do|does|did|can|could|will|would|should|may|might|must|is|are|was|were|have|has|had)\b.*\?$/i,
  ];

  // 目标语言的特定模式
  const targetPatterns = getTargetLanguagePatterns(targetLanguage);

  let englishScore = 0;
  let targetScore = 0;

  // 计算英语匹配分数（带权重）
  englishPatterns.forEach((pattern, index) => {
    if (pattern.test(cleanText)) {
      // 高频词汇权重更高
      englishScore += index < 2 ? 2 : 1;
    }
  });

  // 计算目标语言匹配分数（带权重）
  targetPatterns.forEach((pattern, index) => {
    const matches = cleanText.match(pattern);
    if (matches && matches.length > 0) {
      // 世界语特殊字符权重最高
      if (targetLanguage === 'esperanto' && index === 1) {
        targetScore += matches.length * 5; // 特殊字符高权重
      }
      // 瓦雷利亚语词汇权重最高
      else if (targetLanguage === 'valyrian' && index === 0) {
        targetScore += matches.length * 5; // 瓦雷利亚语词汇最高权重
      }
      // 瓦雷利亚语特殊字符权重次高
      else if (targetLanguage === 'valyrian' && index === 1) {
        targetScore += matches.length * 4; // 瓦雷利亚语特殊字符高权重
      }
      // 词汇模式权重更高
      else if (index < 2) {
        targetScore += matches.length * 2;
      } else {
        targetScore += matches.length;
      }
    }
  });

  // 字符集分析
  const hasNonLatinChars = /[^\x00-\x7F]/.test(cleanText);
  const hasAccentedChars = /[àáâäãåāèéêëēìíîïīòóôöõōùúûüūǜýÿ]/.test(cleanText);

  if (
    hasNonLatinChars &&
    targetLanguage !== 'chinese' &&
    targetLanguage !== 'cuneiform'
  ) {
    // 非拉丁字符（非中文/楔形文字）很可能是目标语言
    targetScore += 3;
  } else if (hasAccentedChars && targetLanguage === 'creole') {
    // 带重音字符很可能是克里奥尔语
    targetScore += 2;
  } else if (!hasNonLatinChars && !hasAccentedChars) {
    // 纯拉丁字符可能是英语
    englishScore += 1;
  }

  // 词长分析（克里奥尔语通常有较多短词）
  const words = cleanText.split(/\s+/).filter((w) => w.length > 0);
  const avgWordLength =
    words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength < 4 && targetLanguage === 'creole') {
    targetScore += 1;
  }

  // 确定检测到的语言
  let detectedLanguage: string;
  let confidence: number;

  if (englishScore === 0 && targetScore === 0) {
    // 无法确定语言
    detectedLanguage = 'unknown';
    confidence = 0;
  } else if (englishScore > targetScore * 1.5) {
    // 明显是英语
    detectedLanguage = 'english';
    confidence = Math.min((englishScore - targetScore) / englishScore, 1);
  } else if (targetScore > englishScore * 1.5) {
    // 明显是目标语言
    detectedLanguage = targetLanguage;
    confidence = Math.min((targetScore - englishScore) / targetScore, 1);
  } else {
    // 不确定，可能是混合语言或其他语言
    detectedLanguage = 'unknown';
    confidence = 0.3;
  }

  // 针对阿拉姆语特殊处理方向映射
  const suggestedDirection =
    targetLanguage === 'aramaic'
      ? (detectedLanguage === 'english' ? 'toAramaic' : 'toEnglish')
      : detectedLanguage === 'english'
        ? 'from-english'
        : detectedLanguage === targetLanguage
          ? 'to-english'
          : 'to-english';

  return {
    detectedLanguage,
    confidence: Math.max(confidence, 0.1),
    suggestedDirection,
  };
}

/**
 * 获取目标语言的特定检测模式
 */
function getTargetLanguagePatterns(language: string): RegExp[] {
  const patterns: Record<string, RegExp[]> = {
    creole: [
      // 海地克里奥尔语常见词汇 - 扩展词汇库
      /\b(bonjou|bonswa|koman|kouman|sak pase|mersi|anpil|souple|wi|non|ale|kite|vini|prale|soti|nan|lakay|timoun|fanm|gason|manje|dlo|solèy|lalin|jwe|chante|danse|travay|dòmi|se|pou|ak|pa|toujou|sou|anba|devan|dèyè|bò|kote|lè|jou|swa|maten|aswè|lendi|madi|mèkredi|jeddi|vandredi|samdi|dimanch)\b/i,
      // 海地克里奥尔语语法特征
      /\b(se\s+\w+|ki\s+\w+|te\s+\w+|ap\s+\w+|ta\s+\w+|kon\s+\w+|fòk\s+\w+|dwe\s+\w+)\b/i,
      // 带重音的字符和特殊字符
      /[àáâäãåāèéêëēìíîïīòóôöõōùúûüūǜýÿ]/g,
      // 海地克里奥尔语特有的复合词
      /\b(\w+ye|\w+yo|\w+an|\w+ou|\w+en|\w+on)\b/i,
    ],
    chinese: [
      /[\u4e00-\u9fff]/g, // 中文字符范围
      /\b(你好|谢谢|再见|请|是|不是|怎么样|你好吗|今天|明天|昨天|我们|他们|这个|那个|什么|为什么|哪里|什么时候|多少)\b/i, // 常见中文词汇
      /\b(wǒ|hěn|hǎo|xièxiè|zàijiàn|qǐng|shì|búshì|zěnmeyàng|jīntiān|míngtiān|zuótiān|wǒmen|tāmen|zhège|nàge|shénme|wèishéme|nǎlǐ|shénme shíhòu|duōshǎo)\b/i, // 拼音检测
    ],
    albanian: [
      /\b(përshëndetje|mirëmëngjes|mirupafshim|faleminderit|tungjatjeta|po|jo|ju lutem|si je|si jeni|qyteti|mirëdita|mirëmbrëma|natën e mirë|punë|shtëpi|familja|amiq|dashuri|paqja|liri|bashkimi|pavarësia|shqip|shqipëria|tiranë|durrës|vlorë|unë|ti|ai|ajo|ne|ata|ato|ky|kjo|këta|këto)\b/i, // 阿尔巴尼亚语常见词汇
      /[ëçç]/g, // 阿尔巴尼亚语特有字符
      /\b(jam|jeni|është|kemi|keni|ka|kan|do|bëj|bën|bëjmë|bëni|bëjnë|kam|ke|ka|kemi|keni|kanë|flas|flet|flasin|them|thoni|thotë|duke|që|për|me|pa|në|deri|nga|tek|së|të|janë|ishte|isnin)\b/i, // 动词变位
    ],
    samoan: [
      /\b(talofa|mālō|faʻafetai|faʻamolemole|lelei|lei|lei mai|faiva|tamaiti|tamaititi|tama|tamaʻitaʻi|tinei|saʻo|lelei|faʻatau|pepē|alofa|manu|samī|vai|lā|pō|masina|fale|nuʻu|lona|tūlaga|tagata|tamāloa|fafine|toʻalua|aiga|gāluega)\b/i, // 萨摩亚语常见词汇
      /[āēīōū]/g, // 长元音字符
      /[ʻ]/g, // 撇号字符
      /\b(ou|lo|lana|latou|tātou|ma|matou|lua|lau|lauā|tolu|tolu|fā|lima|ono|fitu|valu|iva|sefulu|lua sefulu|tolu sefulu)\b/i, // 代词和数字
    ],
    cantonese: [
      /[\u4e00-\u9fff]/g, // 中文字符（粤语也使用汉字）
      /\b(你好|早晨|多謝|唔該|係|唔係|點解|邊度|做乜|食飯|飲茶|返工|放工|鍾意|唔鍾意|對唔住|冇問題|得嘞|拜拜)\b/i, // 粤语特有词汇
      /\b(nei5 hou2|zou2 san4|do1 ze6|m4 goi1|hai6|m4 hai6|dim2 gaai2|bin1 dou6|zou6 mat1|sik6 faan6|jam2 caa4|faan1 gung1|fong3 gung1|zung1 ji3|m4 zung1 ji3|deoi3 m4 zyu6|mou5 man6 tai4|dak1 laak3|baai1 baai3)\b/i, // 粤语拼音检测
    ],
    aramaic: [
      /[\u0700-\u074F\u0840-\u085F]/g, // 叙利亚文和曼达文Unicode范围
      /\b(ܫܠܡܐ|ܥܠܝܟ|ܐܠܗܐ|ܐܢܐ|ܐܢܬܐ|ܐܒܐ|ܐܡܐ|ܚܙܐ|ܐܟܪ|ܐܡܪ|ܡܠܟܐ|ܕܝܢܐ|ܐܪܥܐ|ܫܡܝܐ|ܒܪܐ|ܒܪܬܐ|ܐܚܐ|ܐܚܬܐ|ܟܕܡ|ܟܕܡܬܐ)\b/i, // 阿拉姆语常见词汇
      /[ܐܒܓܕܗܘܙܚܛܝܟܠܡܢܣܥܦܨܩܪܫܬ]/g, // 阿拉姆语字符集
    ],
    baybayin: [
      /[\u1700-\u171F]/g, // 巴贝因文字Unicode范围
      /[\u1720-\u173F]/g, // 巴贝因文字扩展范围
      /[ᜀᜁᜂᜃᜄᜅᜆᜇᜈᜉᜊᜋᜌᜍᜎᜏᜐᜑᜒᜓ᜔᜕᜖᜗᜘᜙᜚᜛᜜]/g, // 巴贝因文字具体字符
    ],
    cuneiform: [
      /[\u12000-\u123FF\u12400-\u1247F]/g, // 楔形文字Unicode范围
      /[\u12480-\u1254F]/g, // 楔形文字数字和标点
    ],
    gaster: [
      // Gaster语言特征 - 基于Wingdings和特殊符号
      /[♠♥♦♣☀☁☂☃❄★☆☽☾]/g,
      /[♔♕♖♗♘♙♚♛♜]/g, // 国际象棋符号
      /[♪♫♬♩♭♮♯]/g, // 音乐符号
      /[✈✉✎✏✐✑✒✓✔✕✖✗✘✙✚✛✜✝✞✟✠✡✢✣✤✥✦✧✨✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❄❅❆❇❈❉❊❋❌❍❎❏❐❑❒❓❔❕❖❗❘❙❚❛❜❝❞❟❠❡❢❣❤❥❦❧❨❩❪❫❬❭❮❯❰❱❲❳❴❵❶❷❸❹❺❻❼❽❾❿➀➁➂➃➄➅➆➇➈➉➊➋➌➍➎➏➐➑➒➓➔➕➖➗➘➙➚➛➜➝➞➟➠➡➢➣➤➥➦➧➨➩➪➫➬➭➮➯➰➱➲➳➴➵➶➷➸➹➺➻➼➽➾➿]/g, // 其他符号
      /\b([ Wingdings Dingbats symbols]+)/g, // Wingdings文字模式
    ],
    valyrian: [
      // 瓦雷利亚语（基于权力的游戏）- 更新词汇库，优先级最高
      /\b(valar|morghulis|ziry|kostilus|kirimvose|lēkia|āeha|uēny|jaelan|va|daor|muña|kepa|vīl|bē|pās|zȳhon|qogralar|kelīrēs|ȳdras|jēda|mērī|skoros|ñuhoso|aelia|vējos|dārys|valonqar|rȳbā|minides|pōja|vēz|mandia|issa|vōlor|jemē|zȳrys|ghesper|mazembar|vōdis|gēlion|rhaes|aeksia|ȳdra|dārā|vāedar|qorrion|lanna|zokla|vēzmen|kelī|tubī|zȳri|kessa|lia|vēzo|gīda|jikagon|keligon|ōñon|dovaogēdy|rytsas|kesys|skorosi|zaldrīzes|valyrio|muño|ēlies|hen|qogralbar|mazverdāghes|gēlenka|irge|zōbrie|jelmāzo|bantis|prōmphas|gevī|rȳnytsia|ñuhor|tobē|vēzos|kelīrīs|dōrī|jikāgon|ao|daorun|qogror|gīda|ñuha|vok|vaesis|jelmā|sōvēs|pāvot|kepa|uēpa|ola|ñuqae|kostilā|valōqas|ullus|qorrbor|lēkia)\b/i, // 瓦雷利亚语词汇
      /[āēīōūȳ]/g, // 长元音和特殊字符 - 最高权重
      /\b(ks|gh|zh|rh|mb|nd|ng|st|th|sh|ch|qu|ph|kh|rh)\b/g, // 辅音组合
    ],
    greek: [
      // 古希腊语
      /[\u0370-\u03FF]/g, // 希腊字母和科普特字母
      /\b(χαῖρε|εὖγε|νῦν|οὐ|μή|ἐγώ|σύ|αὐτός|αὐτή|αὐτό|οὗτος|αὕτη|τοῦτο|τίς|τί|ποῦ|πόθεν|πότε|πῶς|ἵνα|ὅτι|ὡς|γάρ|δέ|τε|μήν|ἀλλά|ἵνα|οὖν|μέν|δἲ|καί|ἢ|εἰ|μὴ|ἐάν|ἄν|οὐκ|οὐχ|οὐμὴ|οὐχὶ)\b/i, // 古希腊语常见词汇
      /[αβγδεζηθικλμνξοπρστυφχψω]/g, // 希腊字母
    ],
    'middle-english': [
      // 中古英语常见词汇和模式
      /\b(knyght|sweorde|godes|soule|herte|lufe|freond|fader|moder|brot|suster|sonne|dohter|kynge|quene|lorde|lady|man|woman|childe|chirche|gode|deue|heuen|helle|world|lyf|deth|tyme|day|nyght|sonne|mone|sterre|fyer|water|erthe|wynd|reyn|snow|hook|crook|bok|letter|song|musike|speche|word|wisdom|sotil|gret|small|longe|shorte|hye|lowe|whyte|blake|reede|grene|blewe|golde|selver|yren|ston|tre| gras|flour|fruyt|bred|wyn|ale|fleshe|fishe|foul|best|hors|ox|cowe|sheep|goat|dogge|cat|mouse|brid|snak|fly|bee|ant|spider|nettle|thistle|rose|lilie|violet|oak|pine|elme|ash|maple|wyllowe|nutt|appel|pere|cherry|grape|figge|date|olive|peper|salt|sugre|hony|melk|chese|butter|egge|ryce|wheate|barley|oates|corn|herbe|spice|saffron|gynger|canel|cloves|noutes|almondes|rysons|fyges|dates|ores|apples|peches|plummes|cherries|berrys|nutes|walnuts|chestenuts|fylenydes|almandes|pynes|pistaches)\b/i, // 日常词汇
      /\b(thou|thee|thy|thine|ye|you|your|yours|our|oure|us|hath|doth|didst|hadst|shalt|shouldst|wilt|wouldst|art|wert|wast|weren|wert|canst|couldst|mayst|mightst|must|ought|nere|nolde|wolde|sholde|kouthe|koude|durst|dirst|dorste|myste|myghte|wost|wyste|wyst|wiste|wite|wot|wit|whilom|sithen|whanne|whan|thanne|than|therto|therfore|forthi|forwhy|forþi|forþy|bifore|before|aftur|after|at|in|on|upon|vpon|of|from|fro|by|wyth|with|with|with|oute|without|within|atwix|atwen|betwix|betwixt|amid|among|amonges|agayns|ayeyns|ayeyn|agayn|agayns|ayenst|aynste|ayenst|aynes|ayns|ayn|an|a|on|o|and|but|ne|nor|or|for|if|whil|til|til|tille|as|so|right|riht|riht|riht|also|al|also|also|al|al|yet|yat|yit|yit|nat|nat|nat|nat|nat|nat|nat|nat|nat|nat|nat|nat|nat)\b/i, // 代词、连词、介词等
      /\b(am|art|is|be|been|bith|beth|was|were|wast|wert|weren|werst|wert|han|hath|have|hast|hath|haven|has|had|haddest|hadde|haddes|shalt|shalt|sholdest|sholdest|sholde|shold|shold|shold|shold|wilt|wilt|wolt|wolt|wold|wold|wold|wold|wold|wold|canst|canst|couth|couthe|couth|couthe|mayst|mayst|mighte|mighte|mighte|mighte|durst|durst|durst|durst|durst|durst|must|must|most|moste|moste|moste|oughte|oughte|oughte|oughte|sholde|sholde|sholde|sholde|wolde|wolde|wolde|wolde|sholde|sholde|sholde|sholde)\b/i, // 动词变位
      /\b(-eth| -es| -en| -e| -ing| -inde| -ande| -yng| -ynge| -ed| -de| -t| -d| -s| -)\b/g, // 动词词尾
      /\b(wh|th|gh|ch|sh|sc|ng|mb|nd|ld|rd|rn)\b/g, // 特殊辅音组合
      /\b(a|e|i|o|u|y|aa|ee|ii|oo|uu|ae|oe|ei|ie|ou|ow|aw|ew)\w+e?\b/g, // 元音模式
      /[\u00E6\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5\u00E6\u00E7\u00E8\u00E9\u00EA\u00EB\u00EC\u00ED\u00EE\u00EF\u00F0\u00F1\u00F2\u00F3\u00F4\u00F5\u00F6\u00F8\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF]/g, // 特殊字符
    ],
    esperanto: [
      // 世界语常见词汇（不依赖特殊字符）
      /\b(saluton|dankon|bonvolu|jes|ne|mi|vi|li|ŝi|ĝi|ni|ili|la|de|da|en|al|sur|sub|inter|kun|sen|anstataŭ|krom|por|dum|antaŭ|post|ĉe|trans|tra|ĝis|je|pri|kaj|sed|aŭ|ke|se|kvankam|ĉar|tial|tiam|kiam|kie|kien|kiel|kiom|kiu|kio|kia|kies|ĉiu|ĉio|ĉia|ĉies|neniu|nenio|nenia|nenes|ĉi|tiu|tio|tia|ties|estas|estis|estos|estus|estus|havas|havis|havos|havus|faras|faris|faros|farus|iras|iris|iros|irus|venas|venis|venos|venus|parolas|parolis|parolos|parolus|vidas|vidis|vidos|vidus|skribas|skribis|skribos|skribus)\b/i, // 世界语常见动词和词汇
      /[ĉĝĥĵŝŭ]/g, // 世界语特有字母（高权重）
      /\b(-as|-is|-os|-us|-u|-anta|-inta|-onta|-ata|-ita|-ota)\b/g, // 世界语动词时态词尾
      /\b(-j|-jn|n)\b/g, // 世界语复数和宾格标记
      /\b(mal|ge|re|dis|ek|for|pra)\b/g, // 世界语前缀
      /\b(-ul|-id|-uj|-ar|-ec|-er|-em|-et|-il|-in|-eg|-aĵ|-ind|-ig|-um|-em|-iĝ|-ad|-an|-on|-aj|-ej)\b/g, // 世界语后缀
      // 普通拉丁字符构成的世界语词汇模式
      /\b(bon|bel|nova|granda|malgranda|juna|maljuna|forta|malforta|varma|malvarma|vera|malvera|facila|malfacila|facilas|facilis|facilos|facilus|parolas|parolis|parolos|parolus|venas|venis|venos|venus|iras|iris|iros|irus|laboras|laboris|laboros|laborus|studas|studis|studos|studus|manĝas|manĝis|manĝos|manĝus|trinkas|trinkis|trinkos|trinkus|dormas|dormis|dormos|dormus)\b/i, // 常见形容词和动词
    ],
    'al-bhed': [
      // Al Bhed语（最终幻想X）
      /\b(Oui|fam|damma|dra|yht|E'syd|yht|kuut|pa|dreo|muja|yht|ruf|yht|bnehda|yht|dra|myhki|yht|vun|du|cusa|yht|yhm|cud|yht|dreo|yht|E'syd|yht|kuut|pa|dreo|muja|yht|ruf|yht|bnehda|yht|dra|myhki|yht|vun)\b/i, // Al Bhed语常见词汇
      // Al Bhed语密码映射（基于英语字母替换）
      // A<->E, I<->U, etc.
      /[bcdfghjklmnpqrstvwxyz]/gi, // 辅音组合
    ],
    'pig-latin': [
      // 猪拉丁语
      /\b(\w+ay|\w+[aeiou]way|\w+[aeiou]\w+ay)/gi, // 猪拉丁语模式
      /\b(a|e|i|o|u)\w+/gi, // 元音开头的词
      /\b(\w[^aeiou]+)ay/gi, // 辅音群开头的词
    ],
  };

  return patterns[language] || [];
}

/**
 * 确定翻译方向
 */
export function determineTranslationDirection(
  text: string,
  targetLanguage: string,
  userDirection?: string
): { direction: string; autoDetected: boolean; explanation: string } {
  const detection = detectLanguage(text, targetLanguage);

  // 如果用户明确指定了方向，尊重用户选择
  if (userDirection) {
    return {
      direction: userDirection,
      autoDetected: false,
      explanation: `使用用户指定的翻译方向: ${userDirection}`,
    };
  }

  // 自动检测并建议最佳方向
  const directionMap: Record<string, Record<string, string>> = {
    creole: {
      'to-english': 'creole-to-en',
      'from-english': 'en-to-creole',
    },
    albanian: {
      'to-english': 'al-to-en',
      'from-english': 'en-to-al',
    },
    chinese: {
      'to-english': 'zh-to-en',
      'from-english': 'en-to-zh',
    },
    samoan: {
      'to-english': 'sm-to-en',
      'from-english': 'en-to-sm',
    },
    cantonese: {
      'to-english': 'yue-to-en',
      'from-english': 'en-to-yue',
    },
  };

  const languageDirectionMap = directionMap[targetLanguage];
  const suggestedDirection =
    languageDirectionMap?.[detection.suggestedDirection];

  return {
    direction: suggestedDirection || 'auto',
    autoDetected: true,
    explanation: `检测到${detection.detectedLanguage === 'english' ? '英语' : targetLanguage}，自动设置为${detection.suggestedDirection === 'to-english' ? '目标语言到英语' : '英语到目标语言'}翻译`,
  };
}
