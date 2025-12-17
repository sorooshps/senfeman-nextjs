import logo from "../../../assets/fonts/ic_neo.png";

export const categories = [
  { name: "۱. پخت و پز", id: 1 },
  { name: "۲. نظافت و شستشو", id: 2 },
  { name: "۳. تهویه و سرما", id: 3 },
  { name: "۴. برقی خانگی", id: 4 },
  { name: "۵. کارهای برقی و تکنولوژیک", id: 5 },
  { name: "۶. سرمایشی و گرمایشی", id: 6 },
];

export const products = [
  { name: "ساندویچ‌ساز", img: logo },
  { name: "پلوپز", img: logo },
  { name: "سرخ‌کن", img: logo },
  { name: "مایکروویو", img: logo },
  { name: "گاز", img: logo },
  { name: "همزن و مخلوط‌کن", img: logo },
];

export const sellers = Array(8).fill({
  name: "عمده فروشی آریا",
  seller: "محمد رفیعی",
  phone: "021-14581987",
  mobile: "09394589647",
  rating: 4.7,
  reviews: 128,
  location: "تهران، میدان انقلاب",
  responseTime: "کمتر از ۵ دقیقه",
  logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center"
});