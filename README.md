# পোর্টফলিও ওয়েবসাইট

স্ট্যাটিক সাইট: কোনো বিল্ড বা সার্ভার লাগে না। GitHub Pages-এ সরাসরি চলে।

## ফাইল কাঠামো

```
portfolio/
├── index.html   পেজের কাঠামো
├── style.css    ডিজাইন (লাইট ও ডার্ক মোড দুটোই আছে)
├── data.js      আপনার সব তথ্য, শুধু এটি এডিট করুন
├── script.js    কনটেন্ট বসানো, ফিল্টার, ফর্ম
└── assets/      photo.jpg (প্রোফাইল ছবি), p1.jpg, p2.jpg… (প্রজেক্টের ছবি)
```

## নিজের তথ্য বসানো

1. `data.js` খুলে নাম, পরিচয়, হোয়াটসঅ্যাপ নম্বর (দেশকোড সহ, `+` ছাড়া), ইমেইল, সোশ্যাল লিংক, সেবা, প্রজেক্ট ও লেখা বদলান।
2. `assets/` ফোল্ডার বানিয়ে `photo.jpg` ও প্রজেক্টের ছবি রাখুন। ছবি না থাকলে রঙিন ব্লক দেখাবে।
3. `index.html`-এর `<title>` ও `meta description` নিজের মতো করুন।

## GitHub Pages-এ ডিপ্লয়

1. GitHub-এ নতুন Public repository খুলুন (যেমন `portfolio`)।
2. **Add file → Upload files** দিয়ে ফাইলগুলো আপলোড করুন (`index.html` রুটে থাকতে হবে) এবং Commit করুন।
3. **Settings → Pages**-এ যান। **Source:** Deploy from a branch, **Branch:** `main`, ফোল্ডার `/ (root)`, তারপর Save।
4. ১-২ মিনিট পর সাইট চালু হবে: `https://আপনার-ইউজারনেম.github.io/portfolio/`

নিজের নামে রিপোজিটরি `ইউজারনেম.github.io` রাখলে লিংক হবে `https://ইউজারনেম.github.io/`।

## নিজের ডোমেইন (ঐচ্ছিক)

Settings → Pages → Custom domain-এ ডোমেইন দিন এবং ডোমেইনের DNS-এ GitHub Pages-এর রেকর্ড বসান।
