"""Transcribe public/main.mp4 audio (16k mono wav) with faster-whisper large-v3, Malay, word timestamps.
Usage: python3 scripts/transcribe.py audio16k.wav transcript/whisper-raw.json
Chunked with overlap because whisper skipped the first 30s window when run in one pass."""
import json, sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
audio,_=sf.read(sys.argv[1],dtype="float32")
out=[]
for (a,b) in [(0,15),(14,29.5),(28.4,42.1)]:
    chunk=audio[int(a*16000):int(b*16000)]
    segs,_=m.transcribe(chunk, language="ms", word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False, no_speech_threshold=0.9,
       initial_prompt="Assalamualaikum. Hari ni saya nak kongsi produk krim ni.")
    for s in segs:
        print(f"[{s.start+a:.2f}-{s.end+a:.2f}] {s.text}")
        out.append({"chunk":a,"start":s.start+a,"end":s.end+a,"text":s.text.strip(),"words":[{"w":w.word.strip(),"s":round(w.start+a,2),"e":round(w.end+a,2),"p":round(w.probability,2)} for w in s.words]})
json.dump(out, open(sys.argv[2],"w"), ensure_ascii=False, indent=1)
