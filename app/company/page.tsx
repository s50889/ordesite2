'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Building2, 
  Users, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Target,
  Award,
  Shield,
  TrendingUp,
  Briefcase,
  Factory,
  Wrench,
  Lightbulb,
  ArrowRight,
  Star,
  Clock,
  CheckCircle,
  Sparkles,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import { Footer } from '@/components/layout/footer'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const companyStats = [
    { icon: Calendar, label: '設立年', value: '1958年', subtext: '創業66年の実績' },
    { icon: Users, label: '従業員数', value: '約60名', subtext: '経験豊富なプロ集団' },
    { icon: TrendingUp, label: '資本金', value: '5,700万円', subtext: '安定した財務基盤' },
    { icon: Building2, label: '事業所', value: '本社・CSセンター', subtext: '兵庫県内2拠点' }
  ]

  const businessAreas = [
    {
      icon: Factory,
      title: '工業用ガス事業',
      description: '酸素・窒素・アルゴン・炭酸ガスなど高純度工業用ガスの製造・販売',
      features: ['高純度ガス製造', '安全配送システム', '技術サポート']
    },
    {
      icon: Wrench,
      title: '機械工具事業',
      description: '切削工具、測定機器、産業機械など精密機械部品の販売',
      features: ['最新技術機器', '保守メンテナンス', 'カスタマイズ対応']
    },
    {
      icon: Lightbulb,
      title: '省エネコンサルティング',
      description: 'エネルギー効率化提案と省エネ設備の導入支援',
      features: ['省エネ診断', '補助金申請支援', 'ROI分析']
    },
    {
      icon: Briefcase,
      title: 'オフィスサプライ事業',
      description: 'OA機器、事務用品、オフィス環境の総合提案',
      features: ['オフィス設計', 'IT機器導入', '維持管理サービス']
    }
  ]

  const certifications = [
    '高圧ガス販売許可',
    '液化石油ガス販売事業者許可',
    '建設業者登録',
    '医薬品販売許可',
    '高度管理医療機器等販売業',
    '毒物劇薬一般販売許可'
  ]

  const timeline = [
    { year: '1958年', event: '創業（昭和33年1月16日）' },
    { year: '1884年', event: 'マッチ工場「日出館」創業' },
    { year: '1892年', event: '「辰馬本家商店」として営業開始' },
    { year: '1917年', event: '辰馬本家酒造株式会社設立' },
    { year: '現在', event: '工業資材総合商社として事業展開' }
  ]

  const tabs = [
    { id: 'overview', label: '会社概要', icon: Building2 },
    { id: 'business', label: '事業内容', icon: Briefcase },
    { id: 'history', label: '沿革', icon: Clock },
    { id: 'locations', label: '事業所', icon: MapPin }
  ]

  return (
    <Navbar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* ヒーローセクション */}
        <section className="relative bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%)'
            }}></div>
          </div>
          
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-8 shadow-2xl"
              >
                <Building2 className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-6"
              >
                タツミ産業株式会社
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl mb-8 opacity-90"
              >
                産業の発展と豊かな暮らしを支え、未来に貢献する
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
              >
                {companyStats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                    <div className="text-xs text-white/70 mt-1">{stat.subtext}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ナビゲーションタブ */}
        <section className="bg-white border-b sticky top-16 z-40">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-3 rounded-md transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* コンテンツエリア */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            
            {/* 会社概要タブ */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">会社概要</h2>
                  <p className="text-lg text-slate-600">創業以来、地域産業を支える工業資材のプロフェッショナル</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <Building2 className="w-6 h-6 mr-3 text-blue-600" />
                        基本情報
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <dt className="font-semibold text-slate-700">設立</dt>
                            <dd className="text-slate-600">昭和33年1月16日</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-700">資本金</dt>
                            <dd className="text-slate-600">5,700万円</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-700">従業員数</dt>
                            <dd className="text-slate-600">約60名</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-slate-700">決算月</dt>
                            <dd className="text-slate-600">12月</dd>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <dt className="font-semibold text-slate-700 mb-2">主要取引銀行</dt>
                          <dd className="text-slate-600">三菱UFJ銀行 姫路支店、三井住友銀行 姫路支店</dd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                        <MapPin className="w-6 h-6 mr-3 text-blue-600" />
                        所在地情報
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2">本社</h4>
                          <p className="text-slate-600 mb-2">〒672-8078<br />兵庫県姫路市飾磨区英賀甲1944番地の2</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              079-234-9200
                            </span>
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              079-234-1580
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2">テクノポリスCSセンター</h4>
                          <p className="text-slate-600 mb-2">〒679-5165<br />兵庫県たつの市新宮町光都1丁目19番1号</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              079-159-8070
                            </span>
                            <span className="flex items-center">
                              <Mail className="w-4 h-4 mr-1" />
                              079-159-8075
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 代表者・役員情報 */}
                <Card className="mt-8 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Users className="w-6 h-6 mr-3 text-blue-600" />
                      役員構成
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg font-semibold text-slate-900">代表取締役会長</div>
                        <div className="text-slate-600">辰巳昌吾</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg font-semibold text-slate-900">代表取締役社長</div>
                        <div className="text-slate-600">辰巳友亮</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                        <div className="text-lg font-semibold text-slate-900">取締役管理部長</div>
                        <div className="text-slate-600">定時直己</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 認可・許可情報 */}
                <Card className="mt-8 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Shield className="w-6 h-6 mr-3 text-blue-600" />
                      取得免許・認可
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {certifications.map((cert, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-slate-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 事業内容タブ */}
            {activeTab === 'business' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">事業内容</h2>
                  <p className="text-lg text-slate-600">幅広い分野で産業界のニーズにお応えします</p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  {businessAreas.map((business, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                              <business.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">{business.title}</h3>
                          </div>
                          <p className="text-slate-600 mb-6">{business.description}</p>
                          <div className="space-y-2">
                            {business.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-slate-600">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* 営業品目 */}
                <Card className="mt-12 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Globe className="w-6 h-6 mr-3 text-blue-600" />
                      主要営業品目
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {[
                        '高圧ガス', '液化石油ガス', '溶接資材', '産業機器',
                        '理化学機器', '配管材料', 'レンタル&リース', '住宅設備機器',
                        '石油製品・工業用薬品', '各種安全保護具', 'ドライアイス', 'OA機器',
                        '事務機器', 'オフィスサプライ', '省エネコンサルティング', '家電製品'
                      ].map((item, index) => (
                        <div key={index} className="text-center p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
                          <div className="text-sm font-medium text-slate-700">{item}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 沿革タブ */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">沿革</h2>
                  <p className="text-lg text-slate-600">創業から現在まで、歩み続ける企業の歴史</p>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-blue-600 to-indigo-600"></div>
                  <div className="space-y-8">
                    {timeline.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="relative flex items-start space-x-6"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <Card className="flex-1 hover:shadow-lg transition-shadow duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {item.year}
                              </span>
                              <span className="text-slate-700">{item.event}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 事業所タブ */}
            {activeTab === 'locations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">事業所案内</h2>
                  <p className="text-lg text-slate-600">兵庫県内の主要拠点をご紹介</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                        <h3 className="text-2xl font-bold text-slate-900">本社</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <p className="text-slate-600 font-medium">〒672-8078</p>
                            <p className="text-slate-600">兵庫県姫路市飾磨区英賀甲1944番地の2</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <p className="text-slate-600">TEL: 079-234-9200</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <p className="text-slate-600">FAX: 079-234-1580</p>
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-slate-700 mb-2">主要業務</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• 工業用ガス販売</li>
                            <li>• 産業機器販売</li>
                            <li>• 本社機能</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="flex items-center mb-6">
                        <Factory className="w-8 h-8 text-indigo-600 mr-3" />
                        <h3 className="text-2xl font-bold text-slate-900">テクノポリスCSセンター</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                          <div>
                            <p className="text-slate-600 font-medium">〒679-5165</p>
                            <p className="text-slate-600">兵庫県たつの市新宮町光都1丁目19番1号</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <p className="text-slate-600">TEL: 079-159-8070</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <p className="text-slate-600">FAX: 079-159-8075</p>
                        </div>
                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                          <h4 className="font-semibold text-slate-700 mb-2">主要業務</h4>
                          <ul className="text-sm text-slate-600 space-y-1">
                            <li>• 研究開発サポート</li>
                            <li>• 理化学機器販売</li>
                            <li>• 技術コンサルティング</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 設備・施設情報 */}
                <Card className="mt-8 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                      <Wrench className="w-6 h-6 mr-3 text-blue-600" />
                      主要設備・施設
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-700">ガス貯蔵設備</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">液体酸素（LO2）貯槽</span>
                            <span className="text-blue-600 font-semibold">15t × 1基</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">液体窒素（LN2）貯槽</span>
                            <span className="text-blue-600 font-semibold">10t × 1基</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">液体アルゴン（LAr）貯槽</span>
                            <span className="text-blue-600 font-semibold">10t × 1基</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-700">その他設備</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">炭酸ガス低温貯槽</span>
                            <span className="text-blue-600 font-semibold">5t × 1基</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">LPGストレージタンク</span>
                            <span className="text-blue-600 font-semibold">20t × 1基</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                            <span className="text-slate-700">圧縮エアー充填装置</span>
                            <span className="text-blue-600 font-semibold">1基</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTAセクション */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-6">お気軽にお問い合わせください</h2>
              <p className="text-xl mb-8 opacity-90">
                工業資材に関するご相談から、省エネ提案まで<br />
                専門スタッフが親身にサポートいたします
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                    お問い合わせ
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold">
                    製品カタログ
                    <Sparkles className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </Navbar>
  )
} 