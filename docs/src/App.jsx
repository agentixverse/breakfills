import React, { useState, useEffect } from "react";
import {
  Copy,
  Play,
  CheckCircle,
  Code,
  Zap,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import breakfillsLogo from "./assets/breakfills.svg";

export default function BreakfillsDocs() {
  const [copiedStates, setCopiedStates] = useState({});
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [starCount, setStarCount] = useState(null);
  const [scripts, setScripts] = useState({
    positionTool: "",
    openModal: "",
    fillOrder: "",
    uiOverlay: "",
  });
  const [expandedBlocks, setExpandedBlocks] = useState({});

  // Handle scroll to show/hide header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide/show after scrolling past 100px to avoid flickering at top
      if (currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else {
        // Scrolling down - hide header
        if (currentScrollY > lastScrollY && isHeaderVisible) {
          setIsHeaderVisible(false);
        }
        // Scrolling up - show header
        else if (currentScrollY < lastScrollY && !isHeaderVisible) {
          setIsHeaderVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isHeaderVisible]);

  // Fetch script files
  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const [positionTool, openModal, fillOrder, uiOverlay] = await Promise.all([
          fetch('/position_tool.txt').then(r => r.text()),
          fetch('/open_modal.txt').then(r => r.text()),
          fetch('/fill_order.txt').then(r => r.text()),
          fetch('/ui_overlay.txt').then(r => r.text()),
        ]);
        setScripts({ positionTool, openModal, fillOrder, uiOverlay });
      } catch (error) {
        console.error('Failed to fetch scripts:', error);
      }
    };
    fetchScripts();
  }, []);

  // Fetch GitHub star count
  useEffect(() => {
    const fetchStarCount = async () => {
      try {
        console.log('Fetching star count...');
        const response = await fetch('https://api.github.com/repos/agentixverse/breakfills', {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('GitHub API response:', data);
        console.log('Star count:', data.stargazers_count);
        setStarCount(data.stargazers_count);
      } catch (error) {
        console.error('Failed to fetch star count:', error);
        console.log('Repository might not exist yet or is private');
        setStarCount('0');
      }
    };

    fetchStarCount();
    
    // Refresh star count every 30 seconds
    const interval = setInterval(fetchStarCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const CodeBlock = ({ code, language = "javascript", title, id }) => {
    const isExpanded = expandedBlocks[id] || false;
    const lines = code.split('\n');
    const shouldTruncate = lines.length > 20;
    const displayCode = shouldTruncate && !isExpanded 
      ? lines.slice(0, 20).join('\n') 
      : code;
    
    const toggleExpanded = () => {
      setExpandedBlocks(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Get file extension for badge
    const getFileExtension = (title) => {
      if (title.includes('position_tool')) return 'js';
      if (title.includes('Modal')) return 'js';
      if (title.includes('Order')) return 'js';
      if (title.includes('UI')) return 'js';
      return 'js';
    };

    const ext = getFileExtension(title);
    const filename = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '.' + ext;

    return (
      <div className="relative bg-[#0d1117] mb-8 border border-[#30363d]">
        {/* Minimal header exactly like vidrune */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
          <div className="flex items-center gap-3">
            <span className="text-[#e6edf3] text-sm font-mono">{filename}</span>
          </div>
          <button
            onClick={() => copyToClipboard(code, id)}
            className="p-2 text-[#7d8590] hover:text-[#e6edf3] hover:bg-[#30363d] transition-colors"
            title="Copy to clipboard"
          >
            {copiedStates[id] ? (
              <CheckCircle size={16} />
            ) : (
              <Copy size={16} />
            )}
          </button>
        </div>
        
        {/* Code content */}
        <div className="relative">
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            showLineNumbers={true}
            customStyle={{
              margin: 0,
              padding: "1.5rem",
              background: "transparent",
              fontSize: "14px",
              lineHeight: "1.6",
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            }}
            lineNumberStyle={{
              color: "#6e7681",
              paddingRight: "1.5rem",
              minWidth: "2.5rem",
              userSelect: "none",
            }}
          >
            {displayCode}
          </SyntaxHighlighter>
          
          {/* Show more/less button */}
          {shouldTruncate && !isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/80 to-transparent pt-12 pointer-events-none">
              <div className="flex justify-center pb-4 pointer-events-auto">
                <button
                  onClick={toggleExpanded}
                  className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-sm border border-[#30363d] transition-colors flex items-center gap-2"
                >
                  Show More ({lines.length - 20} more lines)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          {shouldTruncate && isExpanded && (
            <div className="flex justify-center py-4 bg-[#0d1117]">
              <button
                onClick={toggleExpanded}
                className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-sm border border-[#30363d] transition-colors flex items-center gap-2"
              >
                Show Less
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const allScripts = `${scripts.positionTool}

${scripts.openModal}

${scripts.fillOrder}

${scripts.uiOverlay}`;

  return (
    <div className="min-h-screen bg-white bg-dot-pattern relative">
      {/* Vignette overlay to fade out dots - z-10 */}
      <div className="fixed pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-10"></div>
      
      {/* Header */}
      <header className={`backdrop-blur-md bg-black/80 border-b border-gray-200/50 fixed top-0 left-0 right-0 z-50 supports-[backdrop-filter]:bg-black/20 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={breakfillsLogo} 
                alt="Breakfills Logo" 
                className="h-10"
              />
            </div>
            
            {/* GitHub Star Button */}
            <a 
              href="https://github.com/agentixverse/breakfills" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 hover:border-white/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>Star the repo!</span>
              {starCount !== null && (
                <div className="flex items-center">
                  <span className="font-medium">{starCount}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              )}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 relative z-20 pt-24">
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Automate Your Trade Orders with Breakfills
          </h1>
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            Extract position data from TradingView position tools and
            automatically fill order forms on app.breakoutprop.com
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="mb-12">
          <div className="relative bg-gray-100 overflow-hidden aspect-video border-2 border-dashed border-gray-300">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Demo Video
                </h3>
                <p className="text-gray-500">Watch Breakfills in action</p>
              </div>
            </div>
          </div>
        </div>

        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            What is Breakfills?
          </h2>
          <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
            <p>
              Breakfills is a powerful automation tool designed for traders
              using app.breakoutprop.com. It seamlessly extracts position data from
              TradingView's position tools and automatically fills order
              forms, eliminating manual entry errors and saving valuable time.
            </p>
            <p>
              The tool calculates risk in the underlying currency, determines
              proper position sizing, and handles all the complex calculations
              automatically. Whether you're setting up a long or short position,
              Breakfills ensures your orders are filled accurately based on your
              TradingView analysis.
            </p>
          </div>
        </section>

        {/* How to Use */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Use</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="border border-blue-200 bg-blue-500/20 p-6">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Code size={20} />
                Console Method
              </h3>
              <ol className="text-black space-y-2 text-sm mb-4">
                <li>1. Open app.breakoutprop.com</li>
                <li>2. Press F12 to open DevTools</li>
                <li>3. Go to Console tab</li>
                <li>4. Paste the copied scripts</li>
                <li>5. Press Enter to execute</li>
              </ol>
              
              {/* Copy All Button moved here */}
              <button
                onClick={() => copyToClipboard(allScripts, "all-scripts")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors text-sm w-full justify-center"
              >
                {copiedStates["all-scripts"] ? (
                  <>
                    <CheckCircle size={16} />
                    All Scripts Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy All Scripts
                  </>
                )}
              </button>
            </div>

            <div className="border border-blue-200 bg-blue-900/20 p-6">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Zap size={20} />
                Extension & Source Code
              </h3>
              <p className="text-black text-sm mb-4">
                Want this as a Chrome extension? You can unpack it yourself from the extension folder, 
                or support the project so it gets deployed to the Chrome Web Store. 
                All source code is available on GitHub for transparency and contributions.
              </p>
              
              {/* GitHub Repository Button */}
              <div className="flex flex-col gap-3">
                <a 
                  href="https://github.com/agentixverse/breakfills" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
                
                <button
                  onClick={() => {
                    document.getElementById('support-section').scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Be my Santa this year 🎅
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Code Sections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Individual Scripts
          </h2>
          <p className="text-gray-600 mb-8">
            Each script can be used independently for testing or custom
            workflows:
          </p>

          <CodeBlock
            title="Position Tool"
            code={scripts.positionTool}
            id="position-tool"
          />

          <CodeBlock
            title="Modal Opener"
            code={scripts.openModal}
            id="modal-opener"
          />

          <CodeBlock
            title="Order Filler"
            code={scripts.fillOrder}
            id="order-filler"
          />

          <CodeBlock
            title="UI Overlay"
            code={scripts.uiOverlay}
            id="ui-overlay"
          />
        </section>



        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Troubleshooting
          </h2>
          <div className="space-y-6">
            <div className="border border-blue-200 bg-blue-500/20 p-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                Position not found
              </h3>
              <ul className="text-black space-y-1 text-sm">
                <li>
                  • Ensure you've drawn a position tool on the TradingView
                  chart
                </li>
                <li>
                  • Check console for window.tradingview_XXXXX.chartContent
                </li>
                <li>• Try running PositionTool.clearCache() and retry</li>
              </ul>
            </div>

            <div className="border border-blue-200 bg-blue-500/20 p-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                Modal doesn't open
              </h3>
              <ul className="text-black space-y-1 text-sm">
                <li>
                  • Run ModalOpener.findEmitters() to check for event emitters
                </li>
                <li>
                  • Should find at least 1 emitter with _globalEvents in path
                </li>
                <li>• Refresh the page and try again</li>
              </ul>
            </div>

            <div className="border border-blue-200 bg-blue-500/20 p-6">
              <h3 className="font-semibold text-blue-800 mb-3">
                Form doesn't fill
              </h3>
              <ul className="text-black space-y-1 text-sm">
                <li>
                  • Make sure the order modal is open before calling
                  OrderFiller.fill()
                </li>
                <li>• Check that data-test-id attributes exist in the DOM</li>
                <li>• Verify protection orders are enabled after filling</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section id="support-section" className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            'Tis the season to support devs 🎄
          </h2>
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200 p-8">
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Solana */}
              <div className="bg-white p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    SOL
                  </div>
                  <h4 className="font-semibold text-gray-900">Solana</h4>
                </div>
                <div className="bg-gray-50 p-3 font-mono text-sm text-gray-700 break-all mb-2">
                  6gpTG5HubbgAPFnhjDGGMSs7jX3jr3nrgsD7DCdeTKmW
                </div>
                <button
                  onClick={() => copyToClipboard("6gpTG5HubbgAPFnhjDGGMSs7jX3jr3nrgsD7DCdeTKmW", "sol-address")}
                  className="flex items-center justify-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
                >
                  {copiedStates["sol-address"] ? (
                    <>
                      <CheckCircle size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Address
                    </>
                  )}
                </button>
              </div>

              {/* Ethereum */}
              <div className="bg-white p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    ETH
                  </div>
                  <h4 className="font-semibold text-gray-900">Ethereum & EVM Chains</h4>
                </div>
                <div className="bg-gray-50 p-3 font-mono text-sm text-gray-700 break-all mb-2">
                  0x219373c6b4d3ebec75eb3277f1e25c7f7e962af6
                </div>
                <button
                  onClick={() => copyToClipboard("0x219373c6b4d3ebec75eb3277f1e25c7f7e962af6", "eth-address")}
                  className="flex items-center justify-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
                >
                  {copiedStates["eth-address"] ? (
                    <>
                      <CheckCircle size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Address
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Works on Ethereum, Polygon, BSC, Arbitrum, Optimism, and all EVM-compatible chains
                </p>
              </div>

              {/* Bitcoin */}
              <div className="bg-white p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
                    BTC
                  </div>
                  <h4 className="font-semibold text-gray-900">Bitcoin</h4>
                </div>
                <div className="bg-gray-50 p-3 font-mono text-sm text-gray-700 break-all mb-2">
                  bc1qfxyye250h2gdxuls85p0ms9t65dw7jg8rxuljw
                </div>
                <button
                  onClick={() => copyToClipboard("bc1qfxyye250h2gdxuls85p0ms9t65dw7jg8rxuljw", "btc-address")}
                  className="flex items-center justify-center gap-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm transition-colors"
                >
                  {copiedStates["btc-address"] ? (
                    <>
                      <CheckCircle size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 relative z-20">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-600">
          <p>Built for traders who value precision and efficiency</p>
        </div>
      </footer>
    </div>
  );
}
