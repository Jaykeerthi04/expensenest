import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CategoryTotal } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ExpenseChartProps {
  data: CategoryTotal[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{
    category: string;
    amount: number;
    percentage: number;
    x: number;
    y: number;
  } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (amount: number, total: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount / total);
  };

  const setHoveredSegmentWithDebounce = useCallback((segment: typeof hoveredSegment) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSegment(segment);
      if (segment) {
        drawChart(segment.category);
      } else {
        drawChart();
      }
    }, 50); // Small delay to prevent rapid state changes
  }, []);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const innerRadius = radius * 0.6;

    // Calculate distance from center
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Only process hover if it's within the donut chart area
    if (distance > innerRadius && distance < radius) {
      // Calculate angle of hover relative to center
      const angle = Math.atan2(y - centerY, x - centerX);
      let angleInDegrees = (angle * 180) / Math.PI + 90;
      if (angleInDegrees < 0) angleInDegrees += 360;

      // Find which segment is being hovered
      const total = data.reduce((sum, item) => sum + item.amount, 0);
      let currentAngle = 0;

      for (const item of data) {
        const segmentAngle = (item.amount / total) * 360;
        if (angleInDegrees >= currentAngle && angleInDegrees <= currentAngle + segmentAngle) {
          const tooltipX = event.clientX;
          const tooltipY = event.clientY - 60;

          setHoveredSegmentWithDebounce({
            category: item.category,
            amount: item.amount,
            percentage: item.amount / total,
            x: tooltipX,
            y: tooltipY
          });
          return;
        }
        currentAngle += segmentAngle;
      }
    } else {
      setHoveredSegmentWithDebounce(null);
    }
  }, [data, setHoveredSegmentWithDebounce]);

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredSegmentWithDebounce(null);
  }, [setHoveredSegmentWithDebounce]);

  const drawChart = useCallback((highlightedCategory?: string) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart dimensions
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const innerRadius = radius * 0.6;
    
    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    
    // Draw segments
    let startAngle = -0.5 * Math.PI;
    
    data.forEach((item) => {
      const segmentAngle = (item.amount / total) * (2 * Math.PI);
      const endAngle = startAngle + segmentAngle;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Fill segment with highlight effect if it's the hovered category
      if (item.category === highlightedCategory) {
        // Base fill
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Add subtle glow
        ctx.save();
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        
        // Scale effect
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(1.03, 1.03);
        ctx.translate(-centerX, -centerY);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = item.color;
        ctx.fill();
      }
      
      // Update start angle for next segment
      startAngle = endAngle;
    });
    
    // Create donut hole
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
  }, [data]);
  
  useEffect(() => {
    drawChart();
  }, [data, drawChart]);
  
  // Calculate total
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <div className="relative">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={300}
        className="mx-auto cursor-pointer"
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
      />
      
      {hoveredSegment && (
        <div 
          className="fixed bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-50 transform -translate-x-1/2 transition-opacity duration-150 ease-in-out"
          style={{
            left: `${hoveredSegment.x}px`,
            top: `${hoveredSegment.y}px`,
            minWidth: '150px',
            pointerEvents: 'none'
          }}
        >
          <div className="text-sm font-medium text-gray-800">{hoveredSegment.category}</div>
          <div className="text-sm text-gray-600 mt-1">
            <div>{formatAmount(hoveredSegment.amount)}</div>
            <div className="font-medium text-gray-700">
              {formatPercentage(hoveredSegment.amount, total)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {data.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between mb-2 p-2 hover:bg-gray-50 rounded-md transition-colors duration-150"
            onMouseEnter={() => {
              setHoveredSegmentWithDebounce({
                category: item.category,
                amount: item.amount,
                percentage: item.amount / total,
                x: 0,
                y: 0
              });
            }}
            onMouseLeave={() => {
              setHoveredSegmentWithDebounce(null);
            }}
          >
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-sm mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.category}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">
                {formatPercentage(item.amount, total)}
              </span>
              <span className="font-semibold">
                {formatAmount(item.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseChart;