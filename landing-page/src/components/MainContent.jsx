import React from 'react';
import Slideshow from './Slideshow';

function MainContent() {
  return (
    <main className="flex-grow">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-gradient">
            Transform YouTube Videos Into Engaging Blog Content
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            YT2Blog uses AI to convert your favorite YouTube videos into well-crafted blog articles.
            Simply enter YouTube URLs, provide instructions, and get high-quality content in seconds.
          </p>
        </div>
        
        {/* App Screenshots Slideshow */}
        <div className="mt-12 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">See YT2Blog in Action</h2>
          <Slideshow />
        </div>
        
        {/* Download Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-6">Download YT2Blog</h2>
          <p className="text-lg text-gray-400 text-center max-w-3xl mx-auto mb-10">
            Available for all major platforms. Download the version that works for you.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Mac Download */}
            <div className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <h3 className="text-xl font-semibold mb-3">macOS</h3>
              <p className="text-gray-400 mb-4">For macOS 10.15 and above</p>
              <a href="https://github.com/lagna360/yt2blog/releases/latest/download/yt2blog-mac.dmg" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Download for Mac
              </a>
            </div>
            
            {/* Windows Download */}
            <div className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <h3 className="text-xl font-semibold mb-3">Windows</h3>
              <p className="text-gray-400 mb-4">For Windows 10 and above</p>
              <a href="https://github.com/lagna360/yt2blog/releases/latest/download/yt2blog-win.exe" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Download for Windows
              </a>
            </div>
            
            {/* Linux Download */}
            <div className="bg-gray-800 p-6 rounded-lg text-center hover:bg-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              <h3 className="text-xl font-semibold mb-3">Linux</h3>
              <p className="text-gray-400 mb-4">For major Linux distributions</p>
              <a href="https://github.com/lagna360/yt2blog/releases/latest/download/yt2blog-linux.AppImage" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Download for Linux
              </a>
            </div>
          </div>
          
          {/* Security Note */}
          <div className="mt-8 text-center text-sm text-gray-400 max-w-3xl mx-auto">
            <p className="mb-2"><strong>Note:</strong> You may see security warnings when downloading or opening the application.</p>
            <p className="mb-1">On macOS: If you see a "file is damaged" message, try these solutions:</p>
            <ul className="list-disc list-inside mb-2 pl-4">
              <li>Option 1: Run <code>xattr -d com.apple.quarantine /path/to/yt2blog-mac.dmg</code> in Terminal</li>
              <li>Option 2: Check Security & Privacy settings for an "Open Anyway" option</li>
            </ul>
            <p className="mb-1">On Windows: You may need to click "More info" → "Run anyway" if SmartScreen shows a warning.</p>
            <p>On Linux: You may need to make the AppImage executable with <code>chmod +x yt2blog-linux.AppImage</code> before running it.</p>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Enter YouTube URLs</h3>
              <p className="text-gray-400 text-center">
                Paste one or more YouTube video URLs that you want to transform into blog content.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Provide Instructions</h3>
              <p className="text-gray-400 text-center">
                Tell us how you want your article to look and sound with natural language instructions.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Get Your Blog Article</h3>
              <p className="text-gray-400 text-center">
                Our AI generates a high-quality article based on the video content and your instructions.
              </p>
            </div>
          </div>
        </div>
        
        {/* Open Source Section */}
        <div className="mt-20 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-8 rounded-xl">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">100% Open Source</h2>
            <p className="text-lg text-gray-300 mb-6">
              YT2Blog is completely free and open source. Use it for personal or commercial projects without any restrictions.
              The source code is available on GitHub under the MIT license.
            </p>
            <div className="flex justify-center">
              <a href="https://github.com/lagna360/yt2blog" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View Source Code
              </a>
            </div>
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose YT2Blog?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Free to Use</h3>
                <p className="text-gray-400">No subscription fees, no hidden costs. YT2Blog is completely free to use for both personal and commercial projects.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Free to Modify</h3>
                <p className="text-gray-400">The source code is available under the MIT license, allowing you to modify and customize it to fit your specific needs.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Privacy-Focused</h3>
                <p className="text-gray-400">Your data stays on your device. No data is sent to our servers, ensuring complete privacy and security.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-600 rounded-full p-2 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Community-Driven</h3>
                <p className="text-gray-400">Join a growing community of contributors and users who are constantly improving and expanding the capabilities of YT2Blog.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MainContent;
