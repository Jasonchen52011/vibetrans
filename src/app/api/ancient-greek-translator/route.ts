import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Ancient Greek翻译映射
const ancientGreekTranslations: { [key: string]: string } = {
  // 常用英语到Ancient Greek
  'hello': 'χαῖρε',
  'hi': 'χαῖρε',
  'hey': 'χαῖρε',
  'goodbye': 'εἰρήνη',
  'bye': 'εἰρήνη',
  'yes': 'ναί',
  'no': 'οὐ',
  'thank you': 'εὐχαριστῶ',
  'thanks': 'εὐχαριστῶ',
  'please': 'παρακαλῶ',
  'sorry': 'συγγνώμη',
  'welcome': 'καλώς ὁρᾶτε',
  'good': 'ἀγαθός',
  'bad': 'κακός',
  'great': 'μέγας',
  'small': 'μικρός',
  'big': 'μέγας',
  'help': 'βοήθεια',
  'love': 'ἀγάπη',
  'hate': 'μισῶ',
  'friend': 'φίλος',
  'enemy': 'ἐχθρός',
  'war': 'πόλεμος',
  'peace': 'εἰρήνη',
  'home': 'οἶκος',
  'family': 'οἰκογένεια',
  'child': 'τέκνον',
  'man': 'ἀνήρ',
  'woman': 'γυνή',
  'person': 'ἄνθρωπος',
  'people': 'ἄνθρωποι',
  'star': 'ἀστήρ',
  'sun': 'ἥλιος',
  'moon': 'σελήνη',
  'sky': 'οὐρανός',
  'earth': 'γῆ',
  'water': 'ὕδωρ',
  'fire': 'πῦρ',
  'wind': 'ἄνεμος',
  'life': 'ζωή',
  'death': 'θάνατος',
  'hope': 'ἐλπίς',
  'fear': 'φόβος',
  'courage': 'θάρσος',
  'strength': 'ἰσχύς',
  'wisdom': 'σοφία',
  'knowledge': 'γνῶσις',
  'power': 'δύναμις',
  'force': 'δύναμις',
  'light': 'φῶς',
  'dark': 'σκότος',
  'day': 'ἡμέρα',
  'night': 'νύξ',
  'morning': 'πρωί',
  'evening': 'ἑσπέρα',
  'today': 'σήμερον',
  'tomorrow': 'αὔριον',
  'yesterday': 'ἐχθές',
  'now': 'νῦν',
  'then': 'τότε',
  'here': 'ἐνθάδε',
  'there': 'ἐκεῖ',
  'this': 'οὗτος',
  'that': 'ἐκεῖνος',
  'these': 'οὗτοι',
  'those': 'ἐκεῖνοι',
  'what': 'τί',
  'when': 'πότε',
  'where': 'ποῦ',
  'why': 'διάτι',
  'how': 'πῶς',
  'who': 'τίς',
  'come': 'ἔρχομαι',
  'go': 'πάγω',
  'see': 'βλέπω',
  'hear': 'ἀκούω',
  'speak': 'λαλῶ',
  'eat': 'ἐσθίω',
  'drink': 'πίνω',
  'sleep': 'καθεύδω',
  'work': 'ἐργάζομαι',
  'play': 'παίζω',
  'fight': 'μάχομαι',
  'learn': 'μανθάνω',
  'teach': 'διδάσκω',
  'give': 'δίδωμι',
  'take': 'λαμβάνω',
  'make': 'ποιῶ',
  'do': 'ποιῶ',
  'be': 'εἰμί',
  'have': 'ἔχω',
  'know': 'οἶδα',
  'think': 'νοῶ',
  'feel': 'αἰσθάνομαι',
  'want': 'θέλω',
  'need': 'δέομαι',
  'like': 'φιλῶ',
  'believe': 'πιστεύω',
  'remember': 'μνημονεύω',
  'forget': 'ἐπιλανθάνομαι',
  'create': 'δημιουργῶ',
  'destroy': 'καταστρέφω',
  'build': 'οἰκοδομῶ',
  'break': 'συντρίβω',
  'open': 'ἀνοίγω',
  'close': 'κλείω',
  'begin': 'ἄρχω',
  'end': 'τέλος',
  'start': 'ἄρχω',
  'stop': 'παύω',
  'continue': 'συνεχίζω',
  'finish': 'τελειώνω',
  'change': 'ἀλλάσσω',
  'stay': 'μένω',
  'leave': 'ἀπολείπω',
  'return': 'ἐπιστρέφω',
  'win': 'νικῶ',
  'lose': 'ἀποτυγχάνω',
  'try': 'πειράζω',
  'fail': 'ἀποτυγχάνω',
  'succeed': 'εὐδοκῶ',
  'always': 'πάντοτε',
  'never': 'οὐδέποτε',
  'sometimes': 'ποτέ',
  'only': 'μόνον',
  'just': 'μόνον',
  'also': 'καί',
  'too': 'καί',
  'very': 'σφόδρα',
  'really': 'ὄντως',
  'almost': 'σχεδόν',
  'quite': 'ἱκαναῖως',
  'rather': 'μᾶλλον',
  'enough': 'ἱκανῶς',
  'too much': 'σφόδρα',
  'little': 'ὀλίγος',
  'few': 'ὀλίγοι',
  'many': 'πολλοί',
  'more': 'πλείονας',
  'less': 'ἐλάττους',
  'some': 'τινες',
  'all': 'πάντες',
  'every': 'πᾶς',
  'each': 'ἕκαστος',
  'any': 'τις',
  'both': 'ἀμφότεροι',
  'either': 'ἑκάτερος',
  'neither': 'οὐδετέρος',
  'one': 'εἷς',
  'two': 'δύο',
  'three': 'τρεῖς',
  'four': 'τέτταρες',
  'five': 'πέντε',
  'six': 'ἕξ',
  'seven': 'ἑπτά',
  'eight': 'ὀκτώ',
  'nine': 'ἐννέα',
  'ten': 'δέκα',
  'hundred': 'ἑκατόν',
  'thousand': 'χίλιοι',
  'million': 'εἰκομμύριο',
  'billion': 'δισεκατομμύριο',
  'first': 'πρῶτος',
  'second': 'δεύτερος',
  'third': 'τρίτος',
  'last': 'ἔσχατος',
  'new': 'νέος',
  'old': 'παλαιός',
  'young': 'νέος',
  'ancient': 'ἀρχαῖος',
  'modern': 'νέος',
  'important': 'ἔνδοξος',
  'useful': 'χρήσιμος',
  'useless': 'ἄχρηστος',
  'necessary': 'ἀναγκαῖος',
  'possible': 'δυνατός',
  'impossible': 'ἀδύνατος',
  'easy': 'εὔκολος',
  'difficult': 'δύσκολος',
  'hard': 'σκληρός',
  'soft': 'μαλακός',
  'hot': 'θερμός',
  'cold': 'ψυχρός',
  'warm': 'θερμός',
  'cool': 'ψυχρός',
  'dry': 'ξηρός',
  'wet': 'ὑγρός',
  'clean': 'καθαρός',
  'dirty': 'βρόμικος',
  'pure': 'καθαρός',
  'rich': 'πλούσιος',
  'poor': 'πτωχός',
  'expensive': 'δάπανηρός',
  'cheap': 'φθηνός',
  'free': 'ἐλεύθερος',
  'busy': 'ἀσχολούμενος',
  'empty': 'κενός',
  'full': 'πλήρης',
  'open': 'ἀνοιχτός',
  'closed': 'κλειστός',
  'near': 'ἐγγύς',
  'far': 'μακράν',
  'close': 'ἐγγύς',
  'above': 'ἄνω',
  'below': 'κάτω',
  'inside': 'ἐντός',
  'outside': 'ἐκτός',
  'between': 'μεταξύ',
  'among': 'μεταξύ',
  'around': 'κύκλω',
  'about': 'περί',
  'through': 'διά',
  'across': 'διά',
  'along': 'κατά',
  'against': 'κατά',
  'with': 'μετά',
  'without': 'χωρίς',
  'for': 'ὑπέρ',
  'during': 'κατά',
  'since': 'ἀπό',
  'until': 'ἕως',
  'before': 'πρίν',
  'after': 'μετά',
  'while': 'ἐνώ',
  'because': 'διότι',
  'if': 'ἐάν',
  'unless': 'ἐὰν μὴ',
  'I': 'ἐγώ',
  'you': 'σύ',
  'he': 'αὐτός',
  'she': 'αὐτή',
  'it': 'αὐτό',
  'we': 'ἡμεῖς',
  'you': 'ὑμεῖς',
  'they': 'αὐτοί',
  'my': 'μου',
  'your': 'σου',
  'his': 'αὐτοῦ',
  'her': 'αὐτῆς',
  'its': 'αὐτοῦ',
  'our': 'ἡμῶν',
  'your': 'ὑμῶν',
  'their': 'αὐτῶν',
  'mine': 'ἐμός',
  'yours': 'σός',
  'his': 'αὐτοῦ',
  'hers': 'αὐτῆς',
  'its': 'αὐτοῦ',
  'ours': 'ἡμέτερος',
  'yours': 'ὑμέτερος',
  'theirs': 'αὐτῶν',
  'me': 'με',
  'you': 'σε',
  'him': 'αὐτόν',
  'her': 'αὐτήν',
  'it': 'αὐτό',
  'us': 'ἡμᾶς',
  'you': 'ὑμᾶς',
  'them': 'αὐτούς',
  'myself': 'ἐμαυτον',
  'yourself': 'σεαυτόν',
  'himself': 'αὐτός',
  'herself': 'αὐτή',
  'itself': 'αὐτό',
  'ourselves': 'ἡμεῖς αὐτοί',
  'yourselves': 'ὑμεῖς αὐτοί',
  'themselves': 'αὐτοί'
};

// 反向翻译映射
const englishTranslations: { [key: string]: string } = {};
for (const [english, greek] of Object.entries(ancientGreekTranslations)) {
  englishTranslations[greek] = english;
}

function translateToAncientGreek(text: string): string {
  // 将文本转换为小写进行匹配
  const lowerText = text.toLowerCase();

  // 简单的词汇替换
  let result = text;

  // 按长度排序，优先匹配更长的词
  const sortedKeys = Object.keys(ancientGreekTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, ancientGreekTranslations[key]);
  }

  // 保持标点符号
  return result;
}

function translateToEnglish(text: string): string {
  // 将文本转换为小写进行匹配
  const lowerText = text.toLowerCase();

  // 简单的词汇替换
  let result = text;

  // 按长度排序，优先匹配更长的词
  const sortedKeys = Object.keys(englishTranslations).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    result = result.replace(regex, englishTranslations[key]);
  }

  // 保持标点符号
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, inputType = 'text', direction = 'to-greek' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let translated: string;
    let detectedDirection = direction;

    if (direction === 'to-greek' || direction === 'english-to-greek') {
      translated = translateToAncientGreek(text);
      detectedDirection = 'english-to-greek';
    } else if (direction === 'to-english' || direction === 'greek-to-english') {
      translated = translateToEnglish(text);
      detectedDirection = 'greek-to-english';
    } else {
      // 自动检测方向
      // 简单的启发式方法：检查是否包含已知Greek词汇
      const hasGreekWords = Object.keys(englishTranslations).some(word =>
        text.toLowerCase().includes(word)
      );

      if (hasGreekWords) {
        translated = translateToEnglish(text);
        detectedDirection = 'greek-to-english';
      } else {
        translated = translateToAncientGreek(text);
        detectedDirection = 'english-to-greek';
      }
    }

    return NextResponse.json({
      translated,
      original: text,
      inputType,
      direction: detectedDirection,
      message: 'Translation successful',
      detectedInputLanguage: detectedDirection === 'english-to-greek' ? 'english' : 'ancient-greek'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Ancient Greek translator error:', error);
    }
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Ancient Greek Translator API',
    description: 'Translate between English and Ancient Greek',
    usage: {
      endpoint: '/api/ancient-greek-translator',
      method: 'POST',
      body: {
        text: 'string (required)',
        inputType: 'text (optional, default: text)',
        direction: 'to-greek | to-english | auto (optional, default: auto)'
      }
    },
    availableFeatures: [
      'Ancient Greek translation',
      'Automatic direction detection',
      'Bidirectional translation',
      'Punctuation preservation'
    ],
    script: 'ancient-greek',
    timestamp: new Date().toISOString()
  });
}