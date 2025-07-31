
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Music, Users, Globe, Upload, Download } from 'lucide-react';
import { ReleaseData, TrackData } from '@/pages/Index';

interface ExportStepProps {
  releaseData: ReleaseData;
  tracks: TrackData[];
}

const ExportStep = ({ releaseData, tracks }: ExportStepProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const validateData = () => {
    const issues = [];
    
    // Release validation
    if (!releaseData.title) issues.push('Release title is required');
    if (!releaseData.artists[0]) issues.push('At least one release artist is required');
    if (!releaseData.releaseDate) issues.push('Release date is required');
    if (!releaseData.labelName) issues.push('Label name is required');
    if (!releaseData.albumGenre) issues.push('Album genre is required');
    if (!releaseData.albumCLine) issues.push('Album C Line is required');
    if (!releaseData.albumPLine) issues.push('Album P Line is required');
    
    // Track validation
    tracks.forEach((track, index) => {
      if (!track.title) issues.push(`Track ${index + 1}: Title is required`);
      if (!track.artists[0]) issues.push(`Track ${index + 1}: At least one artist is required`);
      if (!track.trackGenre) issues.push(`Track ${index + 1}: Genre is required`);
      
      const hasPerformer = track.performers.some(p => p.name && p.roles.length > 0);
      const hasComposer = track.composition.some(c => c.name && c.roles.length > 0);
      const hasProducer = track.production.some(p => p.name && p.roles.length > 0);
      
      if (!hasPerformer) issues.push(`Track ${index + 1}: At least one performer with role is required`);
      if (!hasComposer) issues.push(`Track ${index + 1}: At least one composer/writer with role is required`);
      if (!hasProducer) issues.push(`Track ${index + 1}: At least one producer/engineer with role is required`);
    });
    
    return issues;
  };

  const handleExport = async () => {
    const validationIssues = validateData();
    if (validationIssues.length > 0) {
      alert('Please fix the following issues before exporting:\n\n' + validationIssues.join('\n'));
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    // Simulate export process
    const intervals = [10, 25, 50, 75, 90, 100];
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(intervals[i]);
    }

    setIsExporting(false);
    setExportComplete(true);
    
    // Here you would normally handle the actual export
    console.log('Export data:', { releaseData, tracks });
  };

  const countContributors = (track: TrackData) => {
    return track.performers.length + track.composition.length + track.production.length;
  };

  const countFiles = () => {
    let fileCount = 0;
    if (releaseData.artwork) fileCount++;
    tracks.forEach(track => {
      if (track.audioFile) fileCount++;
    });
    return fileCount;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Export Release</h2>
      
      {/* Release Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Release Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Title</h4>
              <p className="text-lg">{releaseData.title}</p>
              {releaseData.mixVersion && (
                <p className="text-sm text-gray-600">{releaseData.mixVersion}</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Primary Artists</h4>
              <p>{releaseData.artists.filter(a => a).join(', ')}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Label</h4>
              <p>{releaseData.labelName}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Genre</h4>
              <p>{releaseData.albumGenre}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Release Date</h4>
              <p>{releaseData.releaseDate}</p>
              {releaseData.isReRelease && releaseData.originalReleaseDate && (
                <p className="text-sm text-gray-600">
                  Original: {releaseData.originalReleaseDate}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Tracks</h4>
              <p>{tracks.length} track{tracks.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {releaseData.featuredArtists.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700">Featured Artists</h4>
              <p>{releaseData.featuredArtists.join(', ')}</p>
            </div>
          )}

          {releaseData.remixers.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700">Remixers</h4>
              <p>{releaseData.remixers.join(', ')}</p>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm">
                {releaseData.isWorldwide ? 'Worldwide Release' : 
                  `${releaseData.territoryMode === 'include' ? 'Include' : 'Exclude'} ${releaseData.territories.length} territories`}
              </span>
            </div>
            
            <div className="flex items-center">
              <Upload className="w-4 h-4 mr-2 text-gray-600" />
              <span className="text-sm">{countFiles()} file{countFiles() !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Track Listing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Track Listing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span className="font-medium">{track.title || 'Untitled'}</span>
                    {track.mixVersion && (
                      <Badge variant="secondary" className="text-xs">
                        {track.mixVersion}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {track.artists.filter(a => a).join(', ')}
                  </p>
                  {track.featuredArtists.length > 0 && (
                    <p className="text-xs text-gray-500">
                      feat. {track.featuredArtists.join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{countContributors(track)} contributors</span>
                  <span>{track.trackGenre}</span>
                  <span>{track.language}</span>
                  {track.audioFile && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {track.dolbyAtmos && <Badge variant="outline" className="text-xs">Atmos</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const issues = validateData();
            if (issues.length === 0) {
              return (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>All data is valid and ready for export</span>
                </div>
              );
            } else {
              return (
                <div className="space-y-2">
                  <div className="flex items-center text-red-600 mb-3">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{issues.length} issue{issues.length !== 1 ? 's' : ''} found</span>
                  </div>
                  <ul className="space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600">• {issue}</li>
                    ))}
                  </ul>
                </div>
              );
            }
          })()}
        </CardContent>
      </Card>

      {/* Export Process */}
      {isExporting && (
        <Card>
          <CardHeader>
            <CardTitle>Exporting Release...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              Processing files and metadata... {exportProgress}%
            </p>
          </CardContent>
        </Card>
      )}

      {exportComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-6 h-6 mr-3" />
              <div>
                <h3 className="font-medium">Export Complete!</h3>
                <p className="text-sm text-green-700">
                  Your release has been successfully submitted for processing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Actions */}
      <div className="flex justify-between">
        <Button variant="outline" disabled={isExporting}>
          Back to Tracks
        </Button>
        
        <Button
          onClick={handleExport}
          disabled={isExporting || validateData().length > 0}
          className="flex items-center bg-green-500 hover:bg-green-600"
        >
          {isExporting ? (
            <>Processing...</>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export All (ZIP)
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ExportStep;
