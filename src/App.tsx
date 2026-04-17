import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Copy, 
  Download, 
  Trash2, 
  Sparkles, 
  Smile, 
  RefreshCw, 
  FileText, 
  AlertTriangle,
  Check,
  ChevronRight,
  Settings2,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { repeatText, enhanceText } from '@/src/services/textService';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [repeatCount, setRepeatCount] = useState(100);
  const [customCount, setCustomCount] = useState('100');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [emojiMode, setEmojiMode] = useState(false);
  const [randomStyle, setRandomStyle] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [tgUser, setTgUser] = useState<any>(null);

  const MAX_PREVIEW = 5000;
  const FILE_THRESHOLD = 10000;
  const FREE_LIMIT = 50000;
  const MAX_REPEAT = isPremium ? 1000000 : FREE_LIMIT;

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      setTgUser(tg.initDataUnsafe?.user || null);
      
      // Apply Telegram theme colors to CSS variables
      const root = document.documentElement;
      if (tg.themeParams.bg_color) root.style.setProperty('--background', tg.themeParams.bg_color);
      if (tg.themeParams.text_color) root.style.setProperty('--foreground', tg.themeParams.text_color);
      if (tg.themeParams.button_color) root.style.setProperty('--primary', tg.themeParams.button_color);
      if (tg.themeParams.button_text_color) root.style.setProperty('--primary-foreground', tg.themeParams.button_text_color);
      if (tg.themeParams.hint_color) root.style.setProperty('--muted-foreground', tg.themeParams.hint_color);
    }
  }, []);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first!');
      return;
    }

    const count = parseInt(customCount) || repeatCount;
    if (!isPremium && count > FREE_LIMIT) {
      toast.error(`Free limit is ${FREE_LIMIT.toLocaleString()}. Upgrade to Pro!`, {
        icon: '💎',
        style: { background: '#1a1a1a', color: '#ff00ff', border: '1px solid #ff00ff' }
      });
      return;
    }

    setIsGenerating(true);
    try {
      let textToRepeat = inputText;
      
      if (emojiMode || randomStyle) {
        setIsEnhancing(true);
        textToRepeat = await enhanceText(inputText, emojiMode ? 'emoji' : 'random');
        setIsEnhancing(false);
      }

      if (count > MAX_REPEAT) {
        toast.error(`Max limit is ${MAX_REPEAT.toLocaleString()}`);
        setIsGenerating(false);
        return;
      }

      const result = repeatText(textToRepeat, count);
      setOutput(result);
      setUsageCount(prev => prev + 1);
      
      if (count >= FILE_THRESHOLD) {
        toast.success('Large output generated! Ready for download.');
      } else {
        toast.success('Text multiplied successfully!');
      }
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ffff', '#ff00ff', '#ffffff']
      });

      // If in Telegram, we could also use the HapticFeedback
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
    } catch (error: any) {
      toast.error(error.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!', {
      icon: '📋',
      style: {
        background: '#1a1a1a',
        color: '#00ffff',
        border: '1px solid #00ffff',
      }
    });
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'multiplied_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started!');
  };

  const handleClear = () => {
    setInputText('');
    setOutput('');
    toast('Cleared everything', { icon: '🗑️' });
  };

  const previewText = output.length > MAX_PREVIEW 
    ? output.substring(0, MAX_PREVIEW) + '...' 
    : output;

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      <Toaster position="top-right" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-4">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold tracking-tighter text-neon"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Text Multiplier <span className="text-accent text-neon-accent">Pro</span> 🔥
            </motion.h1>
            {isPremium && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-accent/20 text-accent border border-accent/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest neon-glow-accent"
              >
                Premium
              </motion.div>
            )}
          </div>
          {tgUser && (
            <p className="text-primary font-medium">Welcome, {tgUser.first_name}! 👋</p>
          )}
          <p className="text-muted-foreground text-lg max-w-2xl">
            Repeat your text up to {MAX_REPEAT.toLocaleString()} times with AI enhancement. 
            {!isPremium && <span className="text-accent cursor-pointer hover:underline ml-2" onClick={() => setIsPremium(true)}>Upgrade to Pro 💎</span>}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="glass border-primary/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                Input Text
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter your text here..."
                  className="min-h-[150px] bg-black/40 border-white/10 focus:border-primary/50 transition-all resize-none text-lg"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Repeat Count
                  </Label>
                  <span className="text-primary font-mono font-bold">
                    {parseInt(customCount).toLocaleString()}x
                  </span>
                </div>
                
                <Slider
                  value={[parseInt(customCount) || 0]}
                  max={10000}
                  step={100}
                  onValueChange={(val) => setCustomCount(val[0].toString())}
                  className="py-4"
                />

                <div className="grid grid-cols-3 gap-2">
                  {[100, 1000, 10000].map((val) => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      className={`border-white/10 hover:border-primary/50 transition-all ${
                        customCount === val.toString() ? 'bg-primary/20 border-primary/50 text-primary' : ''
                      }`}
                      onClick={() => setCustomCount(val.toString())}
                    >
                      {val.toLocaleString()}x
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Custom count..."
                    className="bg-black/40 border-white/10 focus:border-primary/50"
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                  />
                  <Settings2 className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-accent" />
                    <Label htmlFor="emoji-mode" className="cursor-pointer">Emoji Mode</Label>
                  </div>
                  <Switch 
                    id="emoji-mode" 
                    checked={emojiMode} 
                    onCheckedChange={(val) => {
                      setEmojiMode(val);
                      if (val) setRandomStyle(false);
                    }} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <Label htmlFor="random-style" className="cursor-pointer">Random Style</Label>
                  </div>
                  <Switch 
                    id="random-style" 
                    checked={randomStyle} 
                    onCheckedChange={(val) => {
                      setRandomStyle(val);
                      if (val) setEmojiMode(false);
                    }} 
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 neon-glow font-bold h-12"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 h-12"
                  onClick={handleClear}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="glass border-accent/20 flex flex-col">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <FileText className="w-5 h-5" />
                  Output
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={handleCopy}
                    disabled={!output}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-accent"
                    onClick={handleDownload}
                    disabled={!output}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col min-h-[400px]">
              <AnimatePresence mode="wait">
                {!output ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4"
                  >
                    <div className="p-4 rounded-full bg-white/5 border border-white/10">
                      <Zap className="w-12 h-12 opacity-20" />
                    </div>
                    <p className="text-center max-w-[200px]">
                      Your multiplied text will appear here...
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="content"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col"
                  >
                    {parseInt(customCount) >= FILE_THRESHOLD && (
                      <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs text-accent-foreground">
                          Large output detected. Preview is limited to {MAX_PREVIEW.toLocaleString()} characters. 
                          Please download the full TXT file.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex-1 relative group">
                      <div className="absolute inset-0 bg-primary/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                      <div className="relative h-full bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm overflow-y-auto break-all whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/10">
                        {previewText}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        onClick={handleCopy}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                      <Button 
                        className="bg-accent text-accent-foreground hover:bg-accent/90 neon-glow-accent"
                        onClick={handleDownload}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download TXT
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground uppercase tracking-[0.2em]"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Fast Engine Active
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              AI Enhancement Ready
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Secure Processing
            </div>
          </motion.div>

          {/* Admin Panel (Simulated) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-4 rounded-xl border-white/5 flex items-center justify-between max-w-md mx-auto"
          >
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Usage Tracking</p>
                <p className="text-sm font-mono text-primary">{usageCount} Generations</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Status</p>
                <p className="text-sm font-mono text-accent">{isPremium ? 'PRO UNLOCKED' : 'FREE TIER'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] uppercase tracking-tighter hover:bg-white/5"
              onClick={() => setIsPremium(!isPremium)}
            >
              {isPremium ? 'Downgrade' : 'Unlock Pro'}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

