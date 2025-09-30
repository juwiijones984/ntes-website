import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Clock,
  MapPin,
  Phone,
  Mail,
  Utensils,
  Bed,
  Car,
  Wifi,
  Coffee,
  Shield,
  Star
} from 'lucide-react'

interface Message {
  id: string
  text: string
  isBot: boolean
  timestamp: Date
  suggestedQuestions?: string[]
}

interface ChatbotKnowledge {
  keywords: string[]
  response: string
  suggestedQuestions?: string[]
}

export default function HotelChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const knowledgeBase: ChatbotKnowledge[] = [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
      response: "Hello! 👋 Welcome to Tfokomala Hotel and Egumeni Restaurant! I'm here to help you with information about our hotel, restaurant, and services. How can I assist you today?",
      suggestedQuestions: [
        "What are your restaurant hours?",
        "Tell me about hotel amenities",
        "How do I place an order?",
        "What's on the menu today?"
      ]
    },
    {
      keywords: ['restaurant', 'egumeni', 'eats', 'food', 'dining', 'menu'],
      response: "🍽️ Egumeni Restaurant offers delicious South African cuisine and international dishes! We serve University of Mpumalanga staff and hotel guests. Our menu features fresh, locally-sourced ingredients with options for every taste and dietary requirement.",
      suggestedQuestions: [
        "What are your restaurant hours?",
        "Do you have vegetarian options?",
        "How do I place an order?",
        "What's your most popular dish?"
      ]
    },
    {
      keywords: ['hotel', 'tfokomala', 'accommodation', 'rooms', 'stay', 'lodging'],
      response: "🏨 Tfokomala Hotel provides comfortable accommodation with modern amenities. We specialize in hosting University of Mpumalanga staff and visitors, offering a peaceful environment perfect for academic guests and travelers.",
      suggestedQuestions: [
        "What amenities do you offer?",
        "How do I make a reservation?",
        "Do you have conference facilities?",
        "What's included in the room rate?"
      ]
    },
    {
      keywords: ['hours', 'time', 'open', 'close', 'operating', 'schedule'],
      response: "🕐 Our operating hours:\n\n🍽️ Egumeni Restaurant:\n• Breakfast: 6:30 AM - 10:00 AM\n• Lunch: 12:00 PM - 3:00 PM\n• Dinner: 6:00 PM - 10:00 PM\n\n🏨 Hotel Reception: 24/7\n📱 Online ordering through our app: Available 24/7",
      suggestedQuestions: [
        "Can I order outside restaurant hours?",
        "Do you offer room service?",
        "What about weekend hours?"
      ]
    },
    {
      keywords: ['order', 'ordering', 'how to order', 'place order', 'app'],
      response: "📱 Ordering with Egumeni Eats is easy!\n\n1️⃣ Browse our menu in the 'Menu' tab\n2️⃣ Add items to your cart\n3️⃣ Review your order and add special instructions\n4️⃣ Proceed to secure payment\n5️⃣ Track your order in real-time\n\nYou can pay with PayPal, and our kitchen will prepare your order fresh!",
      suggestedQuestions: [
        "How long does delivery take?",
        "What payment methods do you accept?",
        "Can I modify my order after placing it?"
      ]
    },
    {
      keywords: ['amenities', 'facilities', 'services', 'what do you offer'],
      response: "🏨 Tfokomala Hotel Amenities:\n\n🛏️ Comfortable guest rooms with AC\n📶 Free high-speed Wi-Fi\n🚗 Secure parking\n🍽️ On-site restaurant (Egumeni)\n☕ 24/7 coffee station\n💼 Conference & meeting rooms\n🧹 Daily housekeeping\n🛡️ 24/7 security\n🏊 Swimming pool (seasonal)\n🌿 Beautiful garden areas",
      suggestedQuestions: [
        "Do you have conference facilities?",
        "Is parking free?",
        "Do you offer laundry services?"
      ]
    },
    {
      keywords: ['university', 'mpumalanga', 'staff', 'academic', 'faculty'],
      response: "🎓 We proudly serve University of Mpumalanga staff and academic community! We offer:\n\n✅ Special rates for university staff\n✅ Convenient location for campus access\n✅ Quiet environment perfect for academic work\n✅ Meeting spaces for academic collaborations\n✅ Flexible dining options for busy schedules",
      suggestedQuestions: [
        "Do you offer staff discounts?",
        "How close are you to the university?",
        "Can I host academic meetings here?"
      ]
    },
    {
      keywords: ['menu', 'food options', 'dishes', 'what food', 'cuisine'],
      response: "🍽️ Our menu features:\n\n🥩 Traditional South African dishes\n🍖 Grilled meats and braai favorites\n🥗 Fresh salads and vegetarian options\n🍝 International cuisine\n🍰 Delicious desserts\n☕ Premium coffee and beverages\n🌱 Halaal and dietary-friendly options\n\nAll dishes are prepared fresh using quality local ingredients!",
      suggestedQuestions: [
        "Do you have vegetarian dishes?",
        "What's your signature dish?",
        "Do you cater for dietary restrictions?"
      ]
    },
    {
      keywords: ['location', 'address', 'where', 'directions', 'map'],
      response: "📍 Tfokomala Hotel is conveniently located near the University of Mpumalanga campus. We're easily accessible by car and public transport, with secure parking available for guests.\n\n🚗 Free secure parking\n🚌 Public transport links nearby\n🎓 Walking distance to university facilities",
      suggestedQuestions: [
        "How do I get there from the airport?",
        "Is parking available?",
        "How far from the university?"
      ]
    },
    {
      keywords: ['contact', 'phone', 'email', 'call', 'reach you'],
      response: "📞 Contact Information:\n\n📱 Phone: Available through hotel reception\n📧 Email: Available through our reservation system\n🌐 Online: Through this app for restaurant orders\n🏨 Reception: 24/7 for hotel services\n\nFor immediate assistance with your order, use the app's order tracking feature!",
      suggestedQuestions: [
        "Can I call to place an order?",
        "How do I contact reception?",
        "What if I have a complaint?"
      ]
    },
    {
      keywords: ['payment', 'pay', 'paypal', 'card', 'money'],
      response: "💳 We accept secure payments through:\n\n✅ PayPal (online orders)\n✅ Credit/Debit cards\n✅ Cash (at reception)\n✅ Mobile payments\n\n🔒 All payments are secure and encrypted. For restaurant orders, you can pay online before your meal is prepared!",
      suggestedQuestions: [
        "Is PayPal safe to use?",
        "Can I pay cash on delivery?",
        "Do you accept mobile payments?"
      ]
    },
    {
      keywords: ['vegetarian', 'vegan', 'halaal', 'dietary', 'allergies', 'gluten'],
      response: "🌱 We cater to various dietary requirements:\n\n✅ Vegetarian dishes available\n✅ Vegan options on request\n✅ Halaal-friendly meals\n✅ Gluten-free alternatives\n✅ Allergy-conscious preparation\n\nPlease mention any dietary requirements in your order's special instructions, and our kitchen will accommodate your needs!",
      suggestedQuestions: [
        "How do I specify dietary requirements?",
        "Do you have gluten-free bread?",
        "Can you prepare vegan meals?"
      ]
    },
    {
      keywords: ['delivery', 'how long', 'time', 'wait', 'preparation'],
      response: "⏰ Delivery & Preparation Times:\n\n🍽️ Restaurant orders: 15-30 minutes\n🏨 Room service: 20-35 minutes\n🚚 Campus delivery: 25-40 minutes\n\nPreparation time varies by dish complexity. You'll see estimated times when ordering, and can track your order in real-time through the app!",
      suggestedQuestions: [
        "Can I schedule an order for later?",
        "What if my order is delayed?",
        "Do you deliver to campus?"
      ]
    },
    {
      keywords: ['thanks', 'thank you', 'appreciate', 'grateful'],
      response: "You're very welcome! 😊 We're delighted to help. Is there anything else you'd like to know about Tfokomala Hotel or Egumeni Restaurant? We're here to make your experience exceptional!",
      suggestedQuestions: [
        "Tell me about special offers",
        "How do I leave feedback?",
        "Can I make a room reservation?"
      ]
    },
    {
      keywords: ['connection', 'error', 'not working', 'problem', 'issue', 'loading'],
      response: "🔧 I see you might be experiencing some technical issues. Here are some quick troubleshooting tips:\n\n1️⃣ Check your internet connection\n2️⃣ Try refreshing the page\n3️⃣ Clear your browser cache\n4️⃣ Try again in a few minutes\n\nIf problems persist, our technical team is working to resolve any server issues. You can also contact hotel reception directly for immediate assistance!",
      suggestedQuestions: [
        "How do I contact reception?",
        "What are your phone numbers?",
        "Can I order by phone?"
      ]
    }
  ]

  const defaultWelcomeMessage: Message = {
    id: '1',
    text: "Hello! 👋 I'm your Tfokomala Hotel & Egumeni Restaurant assistant. I can help you with information about our hotel, restaurant, menu, services, and more. What would you like to know?",
    isBot: true,
    timestamp: new Date(),
    suggestedQuestions: [
      "What's on the menu today?",
      "Tell me about hotel amenities",
      "How do I place an order?",
      "What are your restaurant hours?"
    ]
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([defaultWelcomeMessage])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const findBestResponse = (userInput: string): ChatbotKnowledge | null => {
    const input = userInput.toLowerCase()
    
    // Find exact keyword matches first
    let bestMatch = knowledgeBase.find(item =>
      item.keywords.some(keyword => input.includes(keyword.toLowerCase()))
    )

    // If no exact match, try partial matches
    if (!bestMatch) {
      bestMatch = knowledgeBase.find(item =>
        item.keywords.some(keyword => {
          const words = keyword.toLowerCase().split(' ')
          return words.some(word => input.includes(word))
        })
      )
    }

    return bestMatch || null
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Check if user is asking about connection/technical issues
    const isConnectionIssue = inputValue.toLowerCase().includes('connection') || 
                              inputValue.toLowerCase().includes('error') || 
                              inputValue.toLowerCase().includes('not working') ||
                              inputValue.toLowerCase().includes('loading') ||
                              inputValue.toLowerCase().includes('problem')

    // Simulate typing delay
    setTimeout(() => {
      const response = findBestResponse(inputValue)
      
      let responseText = response ? response.response : "I'm sorry, I don't have specific information about that. Could you try asking about our hotel amenities, restaurant menu, ordering process, or contact information? I'm here to help with any questions about Tfokomala Hotel and Egumeni Restaurant! 😊"
      
      // If offline, provide helpful offline-specific response
      if (!navigator.onLine && isConnectionIssue) {
        responseText = "🔌 I see you're having connection issues! You're currently offline. Once your internet connection is restored, the app will automatically reconnect and you'll be able to place orders again. In the meantime, you can still browse the menu and add items to your cart - they'll be saved locally! 📱"
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        suggestedQuestions: response ? response.suggestedQuestions : [
          "What are your restaurant hours?",
          "Tell me about hotel amenities",
          "How do I place an order?",
          "What's on the menu today?"
        ]
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleSuggestedQuestion = async (question: string) => {
    if (!question.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Check if user is asking about connection/technical issues
    const isConnectionIssue = question.toLowerCase().includes('connection') || 
                              question.toLowerCase().includes('error') || 
                              question.toLowerCase().includes('not working') ||
                              question.toLowerCase().includes('loading') ||
                              question.toLowerCase().includes('problem')

    // Simulate typing delay
    setTimeout(() => {
      const response = findBestResponse(question)
      
      let responseText = response ? response.response : "I'm sorry, I don't have specific information about that. Could you try asking about our hotel amenities, restaurant menu, ordering process, or contact information? I'm here to help with any questions about Tfokomala Hotel and Egumeni Restaurant! 😊"
      
      // If offline, provide helpful offline-specific response
      if (!navigator.onLine && isConnectionIssue) {
        responseText = "🔌 I see you're having connection issues! You're currently offline. Once your internet connection is restored, the app will automatically reconnect and you'll be able to place orders again. In the meantime, you can still browse the menu and add items to your cart - they'll be saved locally! 📱"
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isBot: true,
        timestamp: new Date(),
        suggestedQuestions: response ? response.suggestedQuestions : [
          "What are your restaurant hours?",
          "Tell me about hotel amenities",
          "How do I place an order?",
          "What's on the menu today?"
        ]
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-ump-orange hover:bg-ump-orange/90 z-50"
          size="lg"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col border-ump-navy/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-ump-navy text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <CardTitle className="text-sm font-medium">Hotel Assistant</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-ump-navy/80 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-1 h-full">
              <div className="p-4 space-y-4 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${message.isBot ? 'bg-ump-orange/10' : 'bg-ump-navy/10'}`}>
                        {message.isBot ? <Bot className="w-3 h-3 text-ump-orange" /> : <User className="w-3 h-3 text-ump-navy" />}
                      </div>
                      <div className={`rounded-lg p-3 ${message.isBot ? 'bg-ump-light-gray border border-ump-navy/10' : 'bg-ump-navy text-white'}`}>
                        <p className={`text-sm whitespace-pre-line ${message.isBot ? 'text-ump-navy' : 'text-white'}`}>{message.text}</p>
                        <p className={`text-xs mt-1 ${message.isBot ? 'text-ump-gray' : 'text-ump-white/70'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Suggested Questions */}
                {messages.length > 0 && messages[messages.length - 1].isBot && messages[messages.length - 1].suggestedQuestions && (
                  <div className="space-y-2">
                    <p className="text-xs text-ump-gray font-medium">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {messages[messages.length - 1].suggestedQuestions!.map((question, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-xs h-auto py-1 px-2 border-ump-orange/30 text-ump-orange hover:bg-ump-orange/10"
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[80%]">
                      <div className="w-6 h-6 rounded-full bg-ump-orange/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-ump-orange" />
                      </div>
                      <div className="bg-ump-light-gray border border-ump-navy/10 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-ump-orange rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-ump-orange rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-ump-orange rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-ump-navy/10 p-3 flex-shrink-0 bg-white">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask me anything about the hotel or restaurant..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm border-ump-navy/20 focus:border-ump-orange focus:ring-ump-orange/20"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim() || isTyping}
                  size="sm"
                  className="bg-ump-orange hover:bg-ump-orange/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}