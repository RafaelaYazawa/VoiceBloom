import React, { useState } from 'react';
import { useStore } from '../../store/store';

interface PrivateNoteFormProps {
  recordingId: string;
}

const PrivateNoteForm: React.FC<PrivateNoteFormProps> = ({ recordingId }) => {
  const { recordings, updateRecording } = useStore();
  const recording = recordings.find(r => r.id === recordingId);
  
  const [reflection, setReflection] = useState(recording?.reflection || '');
  const [metrics, setMetrics] = useState({
    tone: recording?.metrics?.tone || 5,
    confidence: recording?.metrics?.confidence || 5,
    fluency: recording?.metrics?.fluency || 5,
  });

  const handleSave = () => {
    updateRecording(recordingId, {
      reflection,
      metrics,
    });
  };

  const handleMetricChange = (metric: 'tone' | 'confidence' | 'fluency', value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metric]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Self-Reflection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          How did you feel about this recording? What went well? What could you improve?
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full rounded-md border border-input p-3 h-32 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your thoughts here..."
        />
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Rate Your Performance</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Tone</label>
              <span className="text-sm text-muted-foreground">{metrics.tone}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.tone}
              onChange={(e) => handleMetricChange('tone', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Confidence</label>
              <span className="text-sm text-muted-foreground">{metrics.confidence}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.confidence}
              onChange={(e) => handleMetricChange('confidence', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Fluency</label>
              <span className="text-sm text-muted-foreground">{metrics.fluency}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.fluency}
              onChange={(e) => handleMetricChange('fluency', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleSave}
        className="btn-primary w-full"
      >
        Save Reflection
      </button>
    </div>
  );
};

export default PrivateNoteForm;