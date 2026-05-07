import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">AI Token Shop</h3>
            <p className="text-gray-500 text-sm">专业的AI Token账号交易平台，为您提供安全、快捷的购买体验。</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">商品分类</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/products?category=chat" className="hover:text-blue-600">对话类Token</Link></li>
              <li><Link href="/products?category=image" className="hover:text-blue-600">图像生成类</Link></li>
              <li><Link href="/products?category=video" className="hover:text-blue-600">视频生成类</Link></li>
              <li><Link href="/products?category=api" className="hover:text-blue-600">API密钥</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">帮助中心</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/help/faq" className="hover:text-blue-600">常见问题</Link></li>
              <li><Link href="/help/payment" className="hover:text-blue-600">支付说明</Link></li>
              <li><Link href="/help/refund" className="hover:text-blue-600">退款政策</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>客服微信：ai-token-support</li>
              <li>邮箱：support@aitokenshop.com</li>
              <li>工作时间：9:00 - 22:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 AI Token Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
