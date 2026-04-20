import { redirect } from 'next/navigation';

// Next.js חייב שזו תהיה פונקציה שמייצאת "default"
export default function RootPage() {
  redirect('/login');
  return null; // הוספת null אומרת למנוע שאין מה לרנדר כי אנחנו עוברים דף
}