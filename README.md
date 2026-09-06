# Is Takip Programi

4 kisilik guvenlik / denetim ekibi (Nurcan, Nazif, Saban, Hakki) icin web tabanli is takip programi.
Altyapi: **Firebase** (Authentication + Firestore + Hosting). Sunucu kodu yoktur; guvenlik
`firestore.rules` dosyasindaki kurallarla saglanir.

> Bu, **1. adimdir**: giris sistemi + sube tanimlari. Sonraki adimlar: gunluk denetim listesi,
> gorev atama, kasa farki/kamera kaydi, denetim izi (audit log).

---

## Bu adimda ne var

- Sifreli giris (Firebase Authentication).
- Ilk giriste kullanici profilinin otomatik olusturulmasi (rol = normal uye).
- Sube listesi (Alsancak, Kasgar, Zeytinlik, Itimat).
- Sikilastirilmis guvenlik kurallari + bu kurallarin testleri.

---

## Klasor yapisi

```
is-takip/
  firebase.json            Firebase yapilandirmasi (hosting, firestore, emulator)
  firestore.rules          GUVENLIK KURALLARI (en onemli dosya)
  firestore.indexes.json   Firestore dizinleri
  .firebaserc.example      Proje kimligi sablonu (kopyalayip .firebaserc yapin)
  public/                  Arayuz (Firebase Hosting bunu yayinlar)
    index.html             Giris ekrani
    panel.html             Giris sonrasi panel (sube listesi)
    css/style.css
    js/
      config.js            Firebase baglanti ayarlari  (SIZ DOLDURACAKSINIZ)
      constants.js         Sabitler (koleksiyon adlari, roller, subeler, mesajlar)
      firebase-init.js     Firebase baslatma
      auth.js              Giris ekrani mantigi
      panel.js             Panel mantigi
  tests/
    firestore.rules.test.js  Guvenlik kurallari testleri
```

---

## Kurulum (adim adim)

### 1) Firebase projesi olusturun
1. https://console.firebase.google.com adresine Google hesabinizla girin.
2. **"Proje ekle"** deyip bir proje olusturun (or. `is-takip`). Ucretsiz **Spark** plani yeterli.

### 2) Web uygulamasi ekleyip ayarlari alin
1. Proje ana sayfasinda web simgesine (**</>**) tiklayin, bir uygulama ekleyin.
2. Size gosterilen `firebaseConfig` degerlerini kopyalayin.
3. `public/js/config.js` dosyasini acip icindeki degerleri kendi degerlerinizle degistirin.
   > Not: Bu degerler gizli degildir, tarayiciya gonderilmek uzere tasarlanmistir. Guvenlik
   > kurallarla saglanir, bu degerleri saklamaya calismak gerekmez.

### 3) Girisi (Authentication) acin ve 4 kullaniciyi ekleyin
1. Sol menuden **Authentication > Get started**.
2. **Sign-in method** sekmesinde **Email/Password** yontemini **etkinlestirin**.
3. **Users** sekmesinden 4 kisiyi ekleyin. E-posta gercek olmak zorunda degil; sirket ici
   kullanim icin su bicim yeterli:
   - `nurcan@istakip.local`
   - `nazif@istakip.local`
   - `saban@istakip.local`
   - `hakki@istakip.local`
   Her biri icin bir baslangic sifresi belirleyin. (Sifreler kodun icinde tutulmaz.)

### 4) Firestore veritabanini olusturun
1. Sol menuden **Firestore Database > Create database**.
2. **Production mode** secin (kurallari biz yoneteceğiz). Bolge secip olusturun.

### 5) Firebase komut satiri aracini kurun ve baglayin
Bilgisayarinizda **Node.js** kurulu olmali (https://nodejs.org). Sonra terminalde:

```bash
cd is-takip
npm install                 # bagimliliklari kurar
npx firebase login          # Google hesabinizla giris
cp .firebaserc.example .firebaserc
# .firebaserc icindeki "BURAYA-FIREBASE-PROJE-KIMLIGINIZI-YAZIN" yerine
# kendi proje kimliginizi (config.js'deki projectId) yazin.
```

---

## Testleri calistirma (guvenlik kurallari dogrulamasi)

Kurallarin dogru calistigini gormek icin (Java kurulu olmali):

```bash
npm test
```

Bu komut Firestore emulatorunu acar ve `tests/firestore.rules.test.js` icindeki tum testleri
calistirir. Hepsi **PASS** olmali. Testler sunlari dogrular:
- Giris yapmayan hicbir sey yapamaz.
- Kullanici sadece kendi profilini olusturabilir, kendini admin yapamaz.
- Subeleri sadece ekip uyeleri gorebilir, sadece yonetici ekleyip silebilir.
- Tanimsiz koleksiyonlara erisim reddedilir.

---

## Yerelde deneme (kendi bilgisayarinizda, gercek projeye dokunmadan)

```bash
npm run serve
```

Tarayicida `http://localhost:5000` acilir ve emulatore baglanir. Emulator arayuzu
`http://localhost:4000` adresindedir; oradan **Authentication** sekmesine gecip test
kullanicisi ekleyerek girisi deneyebilirsiniz.

---

## Yayina alma (internete cikarma)

```bash
# Once guvenlik kurallarini yayinlayin
npm run deploy:rules

# Sonra arayuzu yayinlayin
npm run deploy:hosting

# Ya da ikisini birden
npm run deploy
```

Yayin sonrasi siteniz `https://PROJE_KIMLIGI.web.app` adresinde acilir.

---

## Ilk yoneticiyi (admin) ayarlama

Guvenlik geregi kimse kendini yonetici yapamaz. Subeleri olusturabilmek icin bir kisi
yonetici olmali (or. Nazif):

1. O kisi bir kez sisteme **giris yapsin** (boylece profili olusur).
2. Firebase Console > **Firestore Database** > `users` koleksiyonu > o kisinin belgesi.
3. `role` alanini `member` -> `admin` olarak degistirin.
4. O kisi panele girince **"Varsayilan subeleri olustur"** dugmesi gorunur; tiklayinca
   Alsancak, Kasgar, Zeytinlik, Itimat subeleri eklenir.

---

## Guvenlik notlari

- `firestore.rules`, sistemin guvenlik kalbidir. Degistirdikten sonra mutlaka `npm test` calistirin.
- Yonetici hesabina (admin rolu) ve Firebase Console erisimine dikkat edin.
- `serviceAccountKey.json` gibi gizli anahtar dosyalari **asla** depoya eklenmez (`.gitignore`de).


---

## Sube Raporu (gunluk sube islem raporu) — 06 Eylul 2026'da eklendi

Programa yeni bir sekme eklendi: **Sube Raporu**. Solibet subelerinin bir onceki gune ait
islem denetimi her sabah **10:00**'da otomatik olarak buraya dusuyor. Sekme SALT OKUNURDUR;
veriyi disaridan bir otomasyon yazar, program sadece gosterir.

### Veri
- Koleksiyon: **`subeRaporu`**
- Belge kimligi: **`YYYY-MM-DD`** (raporun kapsadigi gun)
- Ayrica **`subeRaporu/gunler`** adinda kucuk bir dizin belgesi vardir:
  `{ liste: ["2026-09-05", ...], guncelleme: "<ISO tarih>" }`
  Sekmedeki tarih menusu SADECE bu belgeyi okur. Boylece menu acilirken butun gunlerin
  verisi indirilmez; agir veri yalnizca secilen gun icin cekilir. Yeni bir gun yazan
  otomasyon bu listeyi de guncellemek zorundadir.

Gunluk belgenin alanlari:
```
tarih, gun, olusturmaISO, kaynak
ara     : { kaynaklar:{SUBE:{Betty|Golden|Global|Kiron:{stake,po,ticket}}}, futbol:{SUBE:{...}}, notlar:[] }
kanal   : { toplam, subeler:{SUBE:{kanal:{ONLINE|365|DIGER}, diger:[...], uyusmaz:[...]}} }
denetim : { toplamKayit, managerKayit, subeler:[{sube,ozet,inout,stake,po,manager,managerOzet}], seriler:[], kurus:[] }
```
Belge boyutu gunde ~35 KB (Firestore siniri 1 MB).

### Yetki
`firestore.rules` icinde `RAPOR_ADLARI()` = `['nurcan','nazif','saban','hakki']`.
Bu raporu SADECE bu dort kisi okuyabilir; `levent`, `bahoz`, `durmus` goremez ve
sonradan eklenen bir kullanici da bu listede olmadikca goremez. Yazma yetkisi ayrica
`isAdmin()` ister.

### Kod
- Sekme butonu, `sekme-subeRapor` bolumu, `.sr-*` CSS'i ve `subeRaporCiz()` / `srGoster()` /
  `srHtml()` / `srBulguTablo()` fonksiyonlari `index.html` icindedir.
- Mevcut hicbir bolume dokunulmadi.

### Veriyi kim yaziyor
Nazif'in Claude'da kurdugu **"SOLİBET gunluk sube raporu (sabah 10:00)"** zamanlanmis gorevi.
Gorev bes panelden (Betty Transaction Audit, Betty Profitability, Golden, Global, Kiron,
Solibet Futbol) veriyi toplar, PDF uretir ve ayni veriyi bu koleksiyona yazar.
Isin tam dokumantasyonu: `~/Documents/Claude/Projects/SUBE KONTROL/` klasoru
(`README.md` ve `BETTY_TRANSACTION_AUDIT_SPEC.md`).

### Kasa kapanisi bolumu (07 Eyl 2026'da eklendi)

Sube Raporu sekmesine "Kasa kapanisi — Betty" tablosu eklendi. Veri, gunluk belgenin
`kasa` alanindan gelir:

```
kasa = {
  gun: "YYYY-MM-DD",
  subeler: { ALSANCAK: { tutar, kayitlar:[{saat,personel,tutar,takvim}], gecmis:[{gun,tutar}],
                         takvimGun, birlesik, gecikmeDk, gecKapanis,
                         duzeltme:{dunGun,dun,bugun,net}|null }, ... },
  terminal: { ALSANCAK: [{saat,personel,terminal,tutar}], ... },  // personel farklari, henuz ekranda gosterilmiyor
  ek: { ALSANCAK: {unpaids, nakit, guvenilir, neden}, ... }       // Cash-up ekranindan
}
```
- `tutar` > 0 = kasa FAZLA, < 0 = kasa EKSIK, null = o gun kapanis kaydi yok
- `gecmis` son 7 gunu tutar; ekranda mini cubuk grafik olarak cizilir (her sube kendi olcegi)
- Kaynak: Betty islem kodu 88 (fazla) / 89 (eksik). Kapanis kaydi gece yarisinin iki
  yanina dusebildigi icin saati 00:00-06:00 arasindaki kayit bir onceki gune yazilir.
- Kod: `srKasaHtml()` fonksiyonu, `srHtml()` icinde ARA RAPOR'dan sonra cagriliyor.
- CSS siniflari: `.sr-kasa-tab`, `.sr-spark`, `.sr-sp`

### Sube Raporu'na ne yazilir?

Bu koleksiyona SADECE her sabah 10:00'da calisan zamanlanmis gorevin urettigi
genel gunluk rapor yazilir. Nazif'in ara ara istedigi tek seferlik incelemeler
(ornegin "bugun sadece Itimat'a bak, kasasi fazla") programa YAZILMAZ; cevap
sohbette kalir. Raporun uretim mantigi ve Betty teknik notlari burada degil,
Mac'te `Documents/Claude/Projects/SUBE KONTROL` klasorunde tutuluyor.


### Rapor dili — Betty terimleri

Raporda uydurma Turkce yon etiketi (IN/OUT/FAZLA/EKSIK) kullanilmaz; Betty'nin kendi
ekranindaki adlar yazilir. Cevrim tablosu `SR_BETTY_AD` icinde:
Cash Transfer To/From Shop, Stake Adjustment Up/Down, Payout Adjustment Up/Down,
Cash Transfer To/From Manager, Cash Shop Discrepancy Up/Down, Cash Term Discrepancy Up/Down.
Yeni kayitlar ham `tip` alanini tasir; eski belgelerde `tip` yoksa `SR_ESKI_AD` ile
`yon` kodundan cevrilir.

### Unpaids ve Cash in shop

`kasa.ek` alanindan gelir, kaynagi Cash-up ekrani. `guvenilir:false` ise ayni takvim
gunune iki kapanis dustugu icin Cash-up ikisini toplamistir; o hucre yildizla (*)
isaretlenir ve tek gune ait degildir.


### Kasa tablosundaki rozetler

- **GEC KAPANIS** (kirmizi): sube kapanisi (Shop Cash Close Down) o gunun son terminal
  kapanisindan 1 saatten fazla sonra basilmis. Sabahki Shop Sub Total acilisi fark
  uretmedigi icin, gunduz saatinde gorunen bir kapanis o gece yapilmamis demektir.
- **ONCEKI GUNUN DUZELTMESI** (mavi): bugunku fark, dunku farki ters yonde ve tutarca
  karsiliyor (net, buyuk olanin %5'inden kucuk). Yeni bir olay degil, dunku hatanin
  duzeltilmesi.
