/** PayPal 공식 CDN 로고(컬러). alt는 부모 링크/버튼에서 처리 */
export default function PayPalMarkIcon({ className = 'h-5 w-auto' }: { className?: string }) {
  return (
    <img
      src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
      alt=""
      width={37}
      height={23}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
