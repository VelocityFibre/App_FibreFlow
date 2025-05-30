'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { FaUpload, FaSearch, FaCog, FaMapMarkerAlt, FaDownload, FaLayerGroup } from 'react-icons/fa';

// Types
interface AnalysisParameters {
  structureSize: number;
  structureType: string;
  sensitivity: number;
  filterVegetation: boolean;
  roofMaterial?: string;
  shadowCompensation: boolean;
  minimumConfidence: number;
  excludeZones: boolean;
}

interface AnalysisResult {
  totalStructures: number;
  structureTypes: Record<string, number>;
  confidence: number;
  estimatedArea: number;
  potentialCustomers: number;
  detectionTime: number;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

const PlanningPage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<{image: string, results: AnalysisResult}[]>([]);
  const [showCalibration, setShowCalibration] = useState(false);
  const [imageScale, setImageScale] = useState<number | null>(null);
  const [selectedStructures, setSelectedStructures] = useState<number[]>([]);
  const [parameters, setParameters] = useState<AnalysisParameters>({
    structureSize: 50,
    structureType: 'residential',
    sensitivity: 75,
    filterVegetation: true,
    roofMaterial: 'any',
    shadowCompensation: true,
    minimumConfidence: 60,
    excludeZones: false,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResults(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.geotiff']
    },
    maxFiles: 1
  });

  // Handle clipboard paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = () => {
            setImage(reader.result as string);
            setResults(null);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  }, []);

  // Handle parameter change
  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setParameters({
      ...parameters,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? Number(value) : value
    });
  };

  // Calibrate image scale
  const calibrateScale = () => {
    setShowCalibration(true);
  };

  // Save calibration
  const saveCalibration = (pixelDistance: number, realDistance: number) => {
    const calculatedScale = realDistance / pixelDistance;
    setImageScale(calculatedScale);
    setShowCalibration(false);
  };

  // Run analysis with improved accuracy
  const runAnalysis = () => {
    setIsAnalyzing(true);
    
    // In a real implementation, we would send the image and parameters to a backend API
    // that uses computer vision models like YOLO or Mask R-CNN
    
    // Simulate analysis with a timeout
    setTimeout(() => {
      // Mock results - in a real app, this would come from the CV backend
      const analysisResult = {
        totalStructures: 42,
        structureTypes: {
          residential: 35,
          commercial: 5,
          industrial: 2
        },
        confidence: 0.87,
        estimatedArea: 12500, // square meters
        potentialCustomers: 105, // estimated based on structure types
        detectionTime: 1.2, // seconds
        gpsCoordinates: {
          latitude: 51.5074,
          longitude: -0.1278
        }
      };
      
      setResults(analysisResult);
      
      // Save to history
      if (image) {
        setAnalysisHistory(prev => [...prev, {
          image: image,
          results: analysisResult
        }]);
      }
      setIsAnalyzing(false);
      
      // Draw bounding boxes on canvas (simplified mock)
      if (canvasRef.current && image) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx && imageRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          
          // Draw mock bounding boxes
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          
          // Random boxes for demonstration
          for (let i = 0; i < 42; i++) {
            const x = Math.random() * (canvasRef.current.width - 100);
            const y = Math.random() * (canvasRef.current.height - 100);
            const width = 50 + Math.random() * 50;
            const height = 50 + Math.random() * 50;
            
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = '#00ff00';
            ctx.font = '12px Arial';
            ctx.fillText(`#${i+1}`, x, y - 5);
          }
        }
      }
    }, 2000);
  };

  // Export results with enhanced functionality
  const exportResults = (format: 'csv' | 'pdf' | 'gis') => {
    if (!results) return;
    
    // In a real implementation, we would generate the appropriate file format
    // and trigger a download
    
    // For CSV: Generate a CSV string with all the analysis data
    if (format === 'csv') {
      const csvContent = [
        'Structure Type,Count,Confidence',
        ...Object.entries(results.structureTypes).map(([type, count]) => 
          `${type},${count},${results.confidence.toFixed(2)}`
        )
      ].join('\n');
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `satellite-analysis-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } else {
      // For PDF and GIS formats, we would implement similar functionality
      // but with the appropriate file formats
      alert(`Exporting results in ${format} format. This feature is under development.`);
    }
  };
  
  // Generate network planning recommendations
  const generateRecommendations = () => {
    if (!results) return null;
    
    return (
      <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 mt-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Network Planning Recommendations</p>
        <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Estimated fiber requirement: {Math.round(results.estimatedArea * 0.08)} meters</li>
          <li>• Recommended access points: {Math.ceil(results.totalStructures / 15)}</li>
          <li>• Potential service area coverage: {Math.round(results.estimatedArea * 0.7)} m²</li>
          <li>• Estimated deployment time: {Math.ceil(results.totalStructures / 5)} days</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-[#003049] dark:text-white mb-6">Satellite Imagery Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Upload Area */}
        <div className="lg:col-span-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center bg-[#f0f5f9] dark:bg-[#00406a]"
          {...getRootProps()}
          onPaste={handlePaste}
        >
          {!image ? (
            <>
              <FaUpload className="text-gray-500 dark:text-gray-300 text-4xl mb-4" />
              <p className="text-center text-gray-700 dark:text-gray-200 mb-2">Drag & drop a satellite image here, or click to select files.</p>
              <p className="text-center text-gray-700 dark:text-gray-300 text-sm">You can also paste (Ctrl+V) a screenshot.</p>
              <p className="text-center text-gray-600 dark:text-gray-400 text-xs mt-2">Supports JPEG, PNG, TIFF, and GeoTIFF formats</p>
            </>
          ) : (
            <div className="relative flex-grow border rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={image} 
                  alt="Satellite imagery" 
                  className="max-w-full max-h-full object-contain"
                  ref={imageRef}
                />
              </div>
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full"
                width={800}
                height={600}
              />
              
              {/* Image tools */}
              <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-700 rounded-lg shadow-md p-2 flex space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" title="Zoom In">
                  <FaSearch className="text-gray-700 dark:text-gray-200" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" title="Measure">
                  <FaMapMarkerAlt className="text-gray-700 dark:text-gray-200" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" title="Layers">
                  <FaLayerGroup className="text-gray-700 dark:text-gray-200" />
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Panel - Parameters & Results */}
        <div className="flex flex-col">
          {/* Analysis Parameters */}
          <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg shadow p-4 h-fit border border-[#e0eaf3] dark:border-[#00527b]">
            <div className="flex items-center mb-3">
              <FaCog className="text-[#003049] dark:text-white mr-2" />
              <h2 className="text-lg font-semibold text-[#003049] dark:text-white">Analysis Parameters</h2>
            </div>
            
            <div className="space-y-3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Structure Size (m²)
                </label>
                <input
                  type="range"
                  name="structureSize"
                  min="10"
                  max="200"
                  value={parameters.structureSize}
                  onChange={handleParameterChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>10</span>
                  <span>{parameters.structureSize}</span>
                  <span>200</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Structure Type
                </label>
                <select
                  name="structureType"
                  value={parameters.structureType}
                  onChange={handleParameterChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="mixed">Mixed Use</option>
                  <option value="all">All Types</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Roof Material
                </label>
                <select
                  name="roofMaterial"
                  value={parameters.roofMaterial}
                  onChange={handleParameterChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-[#003049] focus:border-[#003049]"
                >
                  <option value="any">Any Material</option>
                  <option value="metal">Metal</option>
                  <option value="tile">Tile</option>
                  <option value="asphalt">Asphalt</option>
                  <option value="concrete">Concrete</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Detection Sensitivity
                </label>
                <input
                  type="range"
                  name="sensitivity"
                  min="0"
                  max="100"
                  value={parameters.sensitivity}
                  onChange={handleParameterChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>Low</span>
                  <span>{parameters.sensitivity}%</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Minimum Confidence
                </label>
                <input
                  type="range"
                  name="minimumConfidence"
                  min="0"
                  max="100"
                  value={parameters.minimumConfidence}
                  onChange={handleParameterChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>0%</span>
                  <span>{parameters.minimumConfidence}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="filterVegetation"
                    name="filterVegetation"
                    checked={parameters.filterVegetation}
                    onChange={handleParameterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                    Filter out vegetation
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shadowCompensation"
                    name="shadowCompensation"
                    checked={parameters.shadowCompensation}
                    onChange={handleParameterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                    Shadow compensation
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="excludeZones"
                    name="excludeZones"
                    checked={parameters.excludeZones}
                    onChange={handleParameterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700 dark:text-gray-200">
                    Define exclusion zones
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={calibrateScale}
                disabled={!image || isAnalyzing}
                className={`mt-4 flex-1 py-2 px-4 rounded-md font-medium ${
                  !image || isAnalyzing 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-700 text-[#003049] dark:text-white border border-[#003049] dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                Calibrate Scale
              </button>
              
              <button
                onClick={runAnalysis}
                disabled={!image || isAnalyzing}
                className={`mt-4 flex-1 py-2 px-4 rounded-md text-white font-medium ${
                  !image || isAnalyzing 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#003049] hover:bg-[#00273a]'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </div>
          
          {/* Results Section */}
          {results && (
            <div className="bg-[#f0f5f9] dark:bg-[#00406a] rounded-lg p-4 border border-[#e0eaf3] dark:border-[#00527b]">
              <div className="flex items-center mb-3">
                <FaSearch className="text-[#003049] dark:text-white mr-2" />
                <h2 className="text-lg font-semibold text-[#003049] dark:text-white">Analysis Results</h2>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Structures</p>
                  <p className="text-3xl font-bold text-[#003049] dark:text-white">{results.totalStructures}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Structure Types</p>
                  <div className="space-y-1 mt-1">
                    {Object.entries(results.structureTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-sm capitalize text-gray-700 dark:text-gray-200">{type}</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Analysis Details</p>
                  <div className="space-y-1 mt-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Estimated Area</span>
                      <span className="font-medium text-gray-800 dark:text-white">{results.estimatedArea.toLocaleString()} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Potential Customers</span>
                      <span className="font-medium text-gray-800 dark:text-white">{results.potentialCustomers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-200">Processing Time</span>
                      <span className="font-medium text-gray-800 dark:text-white">{results.detectionTime.toFixed(1)}s</span>
                    </div>
                    {results.gpsCoordinates && (
                      <div className="flex justify-between">
                        <span className="text-gray-700 dark:text-gray-200">GPS Coordinates</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {results.gpsCoordinates.latitude.toFixed(4)}, {results.gpsCoordinates.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Confidence Score</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${results.confidence * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-xs text-gray-700 dark:text-gray-300 mt-1">
                    {Math.round(results.confidence * 100)}%
                  </p>
                </div>
                
                {generateRecommendations()}
              </div>
              
              <div className="space-y-3 mt-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => exportResults('csv')}
                    className="flex-1 py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <FaDownload className="inline mr-1" /> CSV
                  </button>
                  <button 
                    onClick={() => exportResults('pdf')}
                    className="flex-1 py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <FaDownload className="inline mr-1" /> PDF
                  </button>
                  <button 
                    onClick={() => exportResults('gis')}
                    className="flex-1 py-2 px-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <FaDownload className="inline mr-1" /> GIS
                  </button>
                </div>
                
                <button 
                  className="w-full py-2 px-3 bg-[#003049] text-white rounded-md text-sm font-medium hover:bg-[#00273a]"
                >
                  Generate Detailed Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;
