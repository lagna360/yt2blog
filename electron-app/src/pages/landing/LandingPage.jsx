import { Link } from 'react-router-dom';
import { ArrowDownTrayIcon, ArrowRightIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="container mx-auto max-w-7xl px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VideoCameraIcon className="h-8 w-8 text-indigo-500" />
          <span className="text-xl font-bold">YouTube to Blog</span>
        </div>
        <nav>
          <Link 
            to="/app" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Launch App <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Transform YouTube Videos Into Professional Blog Articles
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Use AI to automatically convert YouTube content into well-structured, 
              customized blog posts in any style you choose.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/app" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                Launch Web App <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <a 
                href="#download" 
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                Download Desktop App <ArrowDownTrayIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
              <DocumentTextIcon className="h-20 w-20 text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded-full w-full"></div>
              <div className="h-4 bg-gray-700 rounded-full w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded-full w-5/6"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI-Powered Conversion',
                description: 'Leverage advanced AI to transform video content into well-structured articles.'
              },
              {
                title: 'Custom Styling',
                description: 'Specify the tone, style, and format of your generated content with natural language instructions.'
              },
              {
                title: 'Quality Verification',
                description: 'Automatic quality checks ensure your content meets the highest standards.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-700 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="container mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Download Desktop App</h2>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Get the full desktop experience with our native application available for all major platforms.
          <span className="block mt-2 text-yellow-400">
            Note: This app is unsigned. You may see security warnings during installation - this is normal.
          </span>
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              platform: 'macOS',
              icon: '🍎',
              filename: 'YouTube-to-Blog-Mac.dmg'
            },
            {
              platform: 'Windows',
              icon: '🪟',
              filename: 'YouTube-to-Blog-Windows.exe'
            },
            {
              platform: 'Linux',
              icon: '🐧',
              filename: 'YouTube-to-Blog-Linux.AppImage'
            }
          ].map((os, index) => (
            <div key={index} className="bg-gray-800 border border-gray-700 p-6 rounded-xl text-center hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">{os.icon}</div>
              <h3 className="text-xl font-semibold mb-3">For {os.platform}</h3>
              <button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center gap-2"
                onClick={() => alert(`Download for ${os.platform} would start here. In a real app, this would download ${os.filename}`)}
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-10 border-t border-gray-700">
        <div className="container mx-auto max-w-7xl px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} YouTube to Blog. All rights reserved.</p>
          <p className="mt-2">
            This application is for educational purposes only. Not affiliated with YouTube.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
