"""Build narrated field guides, with synchronized English and Arabic captions."""
from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
import wave

from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[1] / "public" / "videos"
W, H, FPS = 960, 540, 15
PAPER, INK, GREEN = "#f5f4e9", "#243d30", "#376653"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
TITLE = ImageFont.truetype(SERIF, 43)
LABEL = ImageFont.truetype(FONT, 27)
SMALL = ImageFont.truetype(FONT, 19)

GUIDES = {
    "cover": ("How cover crops protect soil", [
        ("Cover bare soil", "Between harvests, exposed soil can dry quickly and wash or blow away. A cover crop puts leaves and roots where the ground would otherwise be bare.", "بين المواسم، قد تجف التربة المكشوفة بسرعة وتتآكل بالماء أو الرياح. تغطي أوراق محصول الغطاء وجذوره الأرض المكشوفة."),
        ("Roots make channels", "Leaves soften the impact of rain. Roots can make channels for water to enter the soil. When you end the cover crop, the remaining plant material can keep the soil shaded.", "تخفف الأوراق أثر قطرات المطر. وقد تفتح الجذور مسارات لتسرب الماء إلى التربة. يمكن أن تظل بقايا النباتات تغطي التربة بعد إنهاء المحصول."),
        ("Budget for water", "Living plants also use water. Start on a small strip, count the water it takes to get the crop established, and plan to end it before it competes with your next crop.", "تستهلك النباتات الحية الماء أيضًا. ابدأ بشريط صغير، واحسب مياه الإنبات والنمو الأولي، وخطط لإنهاء المحصول قبل أن ينافس محصولك التالي."),
    ]),
    "trial": ("Plan and manage a trial strip", [
        ("Pick a local window", "Find the gap between your harvest and your next planting. Use your local crop calendar. Choose a cover that suits the season, salinity and irrigation available for your field.", "حدّد الفترة بين الحصاد والزراعة التالية. استخدم تقويم الزراعة المحلي، واختر غطاءً يناسب الموسم والملوحة ومياه الري المتاحة."),
        ("Compare two strips", "Sow one short strip and keep a nearby strip for comparison. Check how evenly the plants establish, how the soil feels near the roots, and how much water each strip uses.", "ازرع شريطًا قصيرًا واترك شريطًا مجاورًا للمقارنة. راقب تجانس النمو ورطوبة التربة حول الجذور وكمية الماء المستخدمة في كل شريط."),
        ("Plan how to end it", "Choose your equipment and how you will manage the residue before you sow. Check machine clearance between rows. In a dry field, ending the cover earlier can protect water for the main crop.", "اختر المعدات وطريقة إدارة البقايا قبل الزراعة. تأكد من وجود مساحة للآلات بين الصفوف. في الحقل الجاف قد يساعد إنهاء الغطاء مبكرًا في توفير الماء للمحصول الرئيسي."),
    ]),
    "field-check": ("Check heat and water before sowing", [
        ("Find hot areas", "Open the heat map and look for warmer areas. Satellite surface temperature can help you choose where to walk first. Check the observation date and compare it with current weather.", "افتح خريطة الحرارة وابحث عن المناطق الأدفأ. تساعدك حرارة السطح من الأقمار الصناعية على اختيار مكان الفحص أولاً. راجع تاريخ المشاهدة وقارنه بالطقس الحالي."),
        ("Check near the roots", "Use your field readings to see whether the soil is too dry or too wet. Check salinity separately. A moisture map can help direct your visit, and a soil test can confirm a salt problem.", "استخدم قراءات الحقل لمعرفة ما إذا كانت التربة جافة أو رطبة أكثر من اللازم. افحص الملوحة بصورة منفصلة. تساعد خريطة الرطوبة على توجيه الزيارة ويؤكد اختبار التربة مشكلة الأملاح."),
        ("Decide whether to sow", "If hot weather is expected or there is too little water for establishment, wait for a better window. Compare rotation options in the planner and start with a small cover crop trial.", "إذا كان الطقس الحار متوقعًا أو مياه الإنبات غير كافية، فانتظر فترة أنسب. قارن خيارات الدورة الزراعية في المخطط، وابدأ بتجربة غطاء صغيرة."),
    ]),
}

def timestamp(seconds):
    millis = round(seconds * 1000)
    return f"{millis // 3600000:02}:{millis // 60000 % 60:02}:{millis // 1000 % 60:02}.{millis % 1000:03}"

def card(title, step, index, progress):
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.text((42, 24), "FALAJ FIELDS", font=SMALL, fill=GREEN)
    draw.text((42, 57), title, font=TITLE, fill=INK)
    draw.rounded_rectangle((42, 137, 918, 458), radius=18, fill="#e5eddc")
    draw.rectangle((43, 307, 917, 435), fill="#d4a977")
    draw.rectangle((43, 307, 917, 333), fill="#b5875c")
    for i in range(32):
        x, y = 62 + i * 26, 347 + ((i * 29) % 76)
        draw.ellipse((x, y, x + 6, y + 3), fill="#ae805d")
    if title.startswith("Check"):
        draw.ellipse((130, 176, 222, 268), fill="#edb871")
        for i, color in enumerate(("#d98c50", "#e6b363", "#85ae7d", "#548968")):
            x = 438 + i * 94
            draw.rounded_rectangle((x, 199, x + 76, 291), radius=10, fill=color)
        if index == 1:
            draw.line((725, 241, 725, 407), fill=INK, width=8)
            draw.ellipse((707, 369, 743, 405), outline="#f5e6ad", width=5)
    else:
        for i in range(7):
            x = 109 + i * 122
            height = 50 + (i * 15 % 45)
            draw.line((x, 307, x, 307 - height), width=5, fill=GREEN)
            for side in (-1, 1):
                a, b = sorted((x, x + side * 31))
                draw.ellipse((a, 311 - height, b, 332 - height), fill="#5b855c")
                if index > 0:
                    draw.line((x, 307, x + side * 30, 400 - i % 3 * 9), width=3, fill="#79543b")
        if index == 0:
            for i in range(18):
                x = 65 + i * 48
                y = 150 + (i * 19 + int(progress * 80)) % 118
                draw.line((x, y, x - 4, y + 12), fill="#75a6b3", width=3)
    draw.text((45, 475), step, font=LABEL, fill=INK)
    draw.rounded_rectangle((660, 492, 915, 499), radius=4, fill="#d5decb")
    draw.rounded_rectangle((660, 492, 660 + int(255 * progress), 499), radius=4, fill=GREEN)
    return image

def run(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)], check=True)

def create(key, title, steps):
    with TemporaryDirectory() as temp:
        root = Path(temp)
        captions = {"en": ["WEBVTT\n"], "ar": ["WEBVTT\n"]}
        elapsed = 0
        segments = []
        for i, (step, spoken, arabic) in enumerate(steps):
            script = root / f"{i}.txt"
            script.write_text(spoken)
            audio = root / f"{i}.wav"
            run("-f", "lavfi", "-i", f"flite=textfile={script}:voice=slt", "-af", "apad=pad_dur=0.6", audio)
            with wave.open(str(audio)) as wavefile:
                duration = wavefile.getnframes() / wavefile.getframerate()
            frames = int(duration * FPS) + 1
            seconds = frames / FPS
            video = root / f"{i}.mp4"
            command = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", str(audio), "-c:v", "libx264", "-preset", "fast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "44100", "-b:a", "80k", "-af", "apad", "-shortest", str(video)]
            with subprocess.Popen(command, stdin=subprocess.PIPE) as proc:
                for frame in range(frames):
                    proc.stdin.write(card(title, step, i, (i + frame / frames) / len(steps)).tobytes())
                proc.stdin.close()
                if proc.wait(): raise RuntimeError(f"Video render failed: {key}")
            segments.append(f"file '{video}'")
            for language, text in (("en", spoken), ("ar", arabic)):
                captions[language].append(f"{timestamp(elapsed)} --> {timestamp(elapsed + seconds)}\n{text}\n")
            elapsed += seconds
        manifest = root / "join.txt"
        manifest.write_text("\n".join(segments))
        run("-f", "concat", "-safe", "0", "-i", manifest, "-c", "copy", "-movflags", "+faststart", OUTPUT / f"{key}.mp4")
        card(title, steps[0][0], 0, 0.15).save(OUTPUT / f"{key}.webp", quality=88)
        for language, lines in captions.items():
            (OUTPUT / f"{key}.{language}.vtt").write_text("\n".join(lines), encoding="utf-8")

if __name__ == "__main__":
    for name, (title, steps) in GUIDES.items():
        create(name, title, steps)
