/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, Download, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PRESETS = [
  "A high quality product shot of a white t-shirt on a wooden table, with the logo printed on the chest.",
  "A black coffee mug sitting on an office desk next to a laptop, logo centered on the mug.",
  "A premium black hoodie worn by a model in a studio setting, logo on the front.",
  "A tote bag hanging on a hook against a white wall, logo printed on the bag.",
  "A clean white baseball cap on a clean studio background, logo embroidered on the front."
];

export default function App() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMockup, setGeneratedMockup] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoBase64(event.target?.result as string);
        setMimeType(file.type);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!logoBase64 || !mimeType) {
      setError("Please upload a logo first.");
      return;
    }
    if (!prompt.trim()) {
      setError("Please enter a text prompt or select a preset.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logoBase64,
          mimeType,
          prompt: `Take this logo and place it naturally in this scene: ${prompt}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate mockup');
      }

      setGeneratedMockup(data.imageUrl);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedMockup) {
      const a = document.createElement('a');
      a.href = generatedMockup;
      a.download = `mockup-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        
        {/* Header */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-950 mb-4">
            Merch Mockup Generator
          </h1>
          <p className="text-lg text-neutral-500">
            Upload your logo and let AI seamlessly place it on products in realistic environments. 
            Perfect for on-demand print shops and merchandise testing.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Controls Side */}
          <div className="space-y-8">
            
            {/* Step 1: Upload */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">1</span>
                Upload Your Logo
              </h2>
              
              <div 
                className={`relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors ${logoBase64 ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 bg-white'} cursor-pointer`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/svg+xml, image/webp" 
                  onChange={handleFileChange}
                />
                
                {logoBase64 ? (
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    <img src={logoBase64} alt="Uploaded logo" className="max-h-full max-w-full object-contain drop-shadow-md" />
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <span className="font-medium text-neutral-700 bg-white px-4 py-2 rounded-full shadow-sm">Replace Logo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Upload className="w-8 h-8 text-neutral-400 mb-3" />
                    <p className="text-sm font-medium text-neutral-700">Click to upload logo</p>
                    <p className="text-xs text-neutral-500 mt-1">PNG, JPG, SVG or WEBP (Transparent background recommended)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Prompt */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-neutral-200">
              <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-sm font-medium text-neutral-600">2</span>
                Describe the Mockup
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700 mb-2">
                    Custom Prompt
                  </label>
                  <textarea
                    id="prompt"
                    rows={4}
                    className="w-full rounded-xl border border-neutral-300 p-4 text-sm focus:border-neutral-500 focus:ring-0 outline-none transition-colors resize-none"
                    placeholder="e.g. A folded black t-shirt on a wooden table..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Or choose a preset:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(preset)}
                        className={`text-xs px-3 py-2 rounded-lg border transition-colors text-left ${prompt === preset ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                      >
                        {preset.length > 40 ? preset.substring(0, 40) + '...' : preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !logoBase64}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-colors shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Mockup...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Mockup
                </>
              )}
            </button>
          </div>

          {/* Results Side */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
              <h2 className="font-medium text-neutral-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Result
              </h2>
              {generatedMockup && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center justify-center relative bg-neutral-50/50">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-neutral-400"
                  >
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-neutral-300" />
                    <p className="text-sm">Applying AI magic to your mockup...</p>
                    <p className="text-xs mt-2 max-w-xs text-center">This can take a few seconds as the model places your logo naturally within the scene.</p>
                  </motion.div>
                ) : generatedMockup ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <img 
                      src={generatedMockup} 
                      alt="Generated Mockup" 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-neutral-200"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-neutral-400"
                  >
                    <ImageIcon className="w-12 h-12 mb-3 text-neutral-300" />
                    <p className="text-sm">Your generated mockup will appear here</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
