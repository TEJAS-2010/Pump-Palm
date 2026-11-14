"""Render three labelled, original educational animations as H.264 video."""
import math
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public" / "videos"
WIDTH, HEIGHT, FPS = 960, 540, 24
INK, GREEN, PAPER, LINE = "#243b2c", "#52714c", "#f6f4e8", "#dce2cf"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
fonts = {size: ImageFont.truetype(FONT, size) for size in (13, 16, 19, 21, 24)}
title_font = ImageFont.truetype(SERIF, 41)
titles = {
    "heat": ("Heat needs a ground check", "Heat", "Check the probe"),
    "salt": ("Moist soil can still stress roots", "Moist soil", "Measure conductivity"),
    "cover": ("Ground cover has a water cost", "Bare soil", "Budget establishment water"),
}

def plant(draw, x, y, size=1.0, shade=GREEN):
    def pt(px, py):
        return (x + px*size, y + py*size)
    draw.line([pt(0,0),pt(0,-82)], fill=shade, width=round(5*size))
    for side, high in ((-1,63),(1,48),(-1,32),(1,78)):
        box = [pt(-39,-high-20),pt(-1,-high+4)] if side<0 else [pt(1,-high-20),pt(39,-high+4)]
        draw.ellipse(box,fill=shade)
    for side in (-1,1):
        draw.line([pt(0,0),pt(side*13,23),pt(side*36,45)], fill="#ad8961", width=max(1,round(3*size)))

def droplet(draw, x,y, size, color):
    draw.polygon([(x,y-size),(x-size*.8,y+size*.16),(x+size*.8,y+size*.16)],fill=color)
    draw.ellipse((x-size*.8,y-size*.08,x+size*.8,y+size),fill=color)

def render(topic, frame):
    time = frame/FPS
    image = Image.new("RGB",(WIDTH,HEIGHT),PAPER)
    d = ImageDraw.Draw(image)
    d.text((43,31),"PUMP PULSE  /  FIELD GUIDE",font=fonts[16],fill=GREEN)
    d.text((43,66),titles[topic][0],font=title_font,fill=INK)
    d.rounded_rectangle((42,135,918,466),radius=22,fill="#fbfaef",outline=LINE,width=2)
    d.rectangle((43,327,917,439),fill="#e6c8a0")
    for n in range(44):
        x = 55+n*19.8
        y = 344+(n*23)%81
        d.ellipse((x,y,x+5,y+3),fill="#c9a578")
    d.line((43,327,917,327),fill="#a88961",width=2)
    progress = max(0,min(1,(time-1.4)/3.2))
    if topic=="heat":
        d.ellipse((135,173,207,245),fill="#eab46b")
        for k in range(8):
            a=k*math.pi/4+time*.11
            d.line((171+42*math.cos(a),209+42*math.sin(a),171+52*math.cos(a),209+52*math.sin(a)),fill="#d38a50",width=3)
        plant(d,362,326,1.15)
        for n in range(6):
            phase=(time*.54+n*.22)%1
            droplet(d,323+n*16+math.sin(phase*6.3)*5,240-phase*73,5,"#9bb9b0")
        d.rounded_rectangle((680,233,713,383),radius=9,fill="#597a6d")
        d.rectangle((689,249,704,277),fill="#d9e8b8")
        radius=20+18*(time%1.5)/1.5
        d.ellipse((696-radius,383-radius,696+radius,383+radius),outline="#708f7b",width=2)
        d.text((746,271),"SOIL",font=fonts[16],fill=INK)
        d.text((746,293),"PROBE",font=fonts[16],fill=INK)
    elif topic=="salt":
        plant(d,278,326,1.1)
        for n in range(15):
            x=97+n*44
            y=345+(n*23)%76
            droplet(d,x,y,7,"#85acb5")
            if n%2==0:
                q=9+3*math.sin(time*2+n)
                d.polygon([(x+17,y-q),(x+17+q,y),(x+17,y+q),(x+17-q,y)],fill="#fff9dc",outline="#9e8b66")
        d.rounded_rectangle((679,191,819,292),radius=14,fill="#e5eee0",outline="#789276",width=2)
        d.text((716,214),"ECw",font=fonts[24],fill=INK)
        d.text((693,252),"WATER EC",font=fonts[16],fill=GREEN)
        d.line((747,292,747,370),fill=GREEN,width=5)
    else:
        for n in range(7):
            x=111+n*111
            size=0.25+progress*(.62+0.1*math.sin(n))
            plant(d,x,326,size)
        for n in range(9):
            phase=(time*.5+n*.175)%1
            droplet(d,103+n*92,175+phase*142,5,"#8bafb5")
        d.line((94,413,868,413),fill="#876641",width=3)
    note = titles[topic][1] if time<3 else titles[topic][2]
    d.rounded_rectangle((60,149,420,184),radius=13,fill="#eff2de")
    d.text((74,157),note,font=fonts[16],fill=INK)
    d.text((45,485),"EDUCATIONAL ANIMATION",font=fonts[13],fill=GREEN)
    d.rounded_rectangle((640,495,915,499),radius=2,fill=LINE)
    d.rounded_rectangle((640,495,640+275*time/7,499),radius=2,fill=GREEN)
    return image

for topic in titles:
    render(topic,85).save(ROOT/(topic+".webp"),quality=88)
    command = ["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pixel_format","rgb24",
        "-video_size",f"{WIDTH}x{HEIGHT}","-framerate",str(FPS),"-i","-","-c:v","libx264",
        "-crf","22","-pix_fmt","yuv420p","-movflags","+faststart",str(ROOT/(topic+".mp4"))]
    with subprocess.Popen(command,stdin=subprocess.PIPE) as proc:
        for i in range(7*FPS):
            proc.stdin.write(render(topic,i).tobytes())
        proc.stdin.close()
        if proc.wait():
            raise RuntimeError(f"FFmpeg failed on {topic}")
