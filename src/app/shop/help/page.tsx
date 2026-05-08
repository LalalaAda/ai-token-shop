import Link from 'next/link';
import { HelpCircle, FileText, ShoppingCart, CreditCard, Key, Shield, MessageSquare } from 'lucide-react';

const faqCategories = [
  {
    icon: ShoppingCart,
    title: '购买指南',
    items: [
      { q: '如何购买商品？', a: '浏览商品列表 → 选择商品加入购物车 → 前往结算页 → 选择支付方式 → 完成支付 → 自动获取卡密' },
      { q: '购买后多久能收到卡密？', a: '支付成功后，系统会自动发放卡密，您可以在「我的卡密」页面立即查看。' },
      { q: '可以取消订单吗？', a: '未支付的订单可在30分钟内自动取消，已支付的订单请联系客服处理退款。' },
    ],
  },
  {
    icon: CreditCard,
    title: '支付问题',
    items: [
      { q: '支持哪些支付方式？', a: '目前支持微信支付和支付宝。演示模式下提供模拟支付功能。' },
      { q: '支付失败怎么办？', a: '请检查支付账户余额是否充足，或尝试切换支付方式。如问题持续，请联系客服。' },
      { q: '支付后未收到卡密？', a: '请先检查「我的卡密」页面，如确实未收到，请联系客服提供订单号进行核查。' },
    ],
  },
  {
    icon: Key,
    title: '卡密使用',
    items: [
      { q: '如何查看购买的卡密？', a: '登录后进入「用户中心」→「我的卡密」，即可查看所有已购买的卡密信息。' },
      { q: '卡密可以复制吗？', a: '是的，在我的卡密页面点击复制按钮即可复制卡密到剪贴板。' },
      { q: '卡密有有效期吗？', a: '大部分卡密为永久有效，具体以商品详情页标注的有效期为准。过期卡密将无法使用。' },
    ],
  },
  {
    icon: Shield,
    title: '账户安全',
    items: [
      { q: '如何修改密码？', a: '登录后在「用户中心」→「设置」页面可以修改昵称和头像。密码修改功能请联系客服。' },
      { q: '账户被锁定怎么办？', a: '多次登录失败可能导致账户临时锁定，请稍后再试或联系客服解封。' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">帮助中心</h1>
        <p className="text-gray-500">常见问题解答和使用指南</p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category, i) => (
          <div key={i} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
              <category.icon className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">{category.title}</h2>
            </div>
            <div className="divide-y">
              {category.items.map((item, j) => (
                <details key={j} className="group">
                  <summary className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{item.q}</span>
                    <HelpCircle className="w-4 h-4 text-gray-400 group-open:rotate-180 transition" />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">没有找到答案？</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">请联系客服，我们会尽快回复您</p>
        <Link href="/shop/user" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          联系客服
        </Link>
      </div>
    </div>
  );
}
