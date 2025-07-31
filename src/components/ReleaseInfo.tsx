
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Upload } from 'lucide-react';
import { ReleaseData } from '@/pages/Index';

interface ReleaseInfoProps {
  data: ReleaseData;
  onChange: (data: ReleaseData) => void;
}

const genres = [
  'Rock', 'Pop', 'Dance', 'Electronic', 'Hip-Hop/Rap', 'R&B/Soul',
  'Classical', 'Jazz', 'Folk', 'Country', 'Metal', 'Blues', 'Reggae',
  'Punk', 'World', 'Latin', 'Indie', 'Alternative', 'Techno', 'House'
];

const continents = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway'],
  'Asia': ['Japan', 'China', 'South Korea', 'India', 'Thailand', 'Singapore'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
  'Africa': ['South Africa', 'Nigeria', 'Kenya', 'Egypt'],
  'Oceania': ['Australia', 'New Zealand']
};

// All individual countries for the dropdown
const allCountries = Object.values(continents).flat().sort();

const ReleaseInfo = ({ data, onChange }: ReleaseInfoProps) => {
  const [showMixVersion, setShowMixVersion] = useState(!!data.mixVersion);
  const [showFeaturedArtists, setShowFeaturedArtists] = useState(data.featuredArtists.length > 0);
  const [showRemixers, setShowRemixers] = useState(data.remixers.length > 0);
  const [dragActive, setDragActive] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  const updateData = (updates: Partial<ReleaseData>) => {
    onChange({ ...data, ...updates });
  };

  const updateArtistList = (listName: 'artists' | 'featuredArtists' | 'remixers', index: number, value: string) => {
    const newList = [...data[listName]];
    newList[index] = value;
    updateData({ [listName]: newList });
  };

  const addArtist = (listName: 'artists' | 'featuredArtists' | 'remixers') => {
    const newList = [...data[listName], ''];
    updateData({ [listName]: newList });
  };

  const removeArtist = (listName: 'artists' | 'featuredArtists' | 'remixers', index: number) => {
    const newList = data[listName].filter((_, i) => i !== index);
    updateData({ [listName]: newList });
    
    if (listName === 'featuredArtists' && newList.length === 0) {
      setShowFeaturedArtists(false);
    }
    if (listName === 'remixers' && newList.length === 0) {
      setShowRemixers(false);
    }
  };

  const addContinent = (continent: string) => {
    const countries = continents[continent as keyof typeof continents];
    const newTerritories = [...new Set([...data.territories, ...countries])];
    updateData({ territories: newTerritories });
  };

  const addIndividualTerritory = (territory: string) => {
    if (!data.territories.includes(territory)) {
      const newTerritories = [...data.territories, territory];
      updateData({ territories: newTerritories });
    }
  };

  const removeTerritory = (territory: string) => {
    const newTerritories = data.territories.filter(t => t !== territory);
    updateData({ territories: newTerritories });
  };

  const handleFileUpload = (file: File) => {
    updateData({ artwork: file });
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setArtworkPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const triggerFileInput = () => {
    document.getElementById('artwork-upload')?.click();
  };

  const getTerritoryHelperText = () => {
    if (data.territoryMode === 'include') {
      return "Release will be available ONLY in selected territories";
    }
    return "Release will be available worldwide EXCEPT for selected territories";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Release Information</h2>
      
      {/* Release Identification */}
      <Card>
        <CardHeader>
          <CardTitle>Release Identification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Release Title *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="Enter release title"
            />
          </div>
          
          {!showMixVersion ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowMixVersion(true)}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Mix/Version
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="mixVersion">Release Mix/Version</Label>
                <Input
                  id="mixVersion"
                  value={data.mixVersion || ''}
                  onChange={(e) => updateData({ mixVersion: e.target.value })}
                  placeholder="e.g., Deluxe Edition, Remix Album"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowMixVersion(false);
                  updateData({ mixVersion: undefined });
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Artist Management */}
      <Card>
        <CardHeader>
          <CardTitle>Artists</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Release Artist(s) *</Label>
            {data.artists.map((artist, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <Input
                  value={artist}
                  onChange={(e) => updateArtistList('artists', index, e.target.value)}
                  placeholder="Artist name"
                />
                {index === data.artists.length - 1 && (
                  <Button type="button" size="sm" onClick={() => addArtist('artists')}>
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                {index > 0 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeArtist('artists', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {!showFeaturedArtists ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowFeaturedArtists(true);
                if (data.featuredArtists.length === 0) {
                  updateData({ featuredArtists: [''] });
                }
              }}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Featured Artist
            </Button>
          ) : (
            <div>
              <Label>Featured Artist(s)</Label>
              {data.featuredArtists.map((artist, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={artist}
                    onChange={(e) => updateArtistList('featuredArtists', index, e.target.value)}
                    placeholder="Featured artist name"
                  />
                  {index === data.featuredArtists.length - 1 && (
                    <Button type="button" size="sm" onClick={() => addArtist('featuredArtists')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeArtist('featuredArtists', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!showRemixers ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowRemixers(true);
                if (data.remixers.length === 0) {
                  updateData({ remixers: [''] });
                }
              }}
              className="text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Remixer
            </Button>
          ) : (
            <div>
              <Label>Remixer(s)</Label>
              {data.remixers.map((artist, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={artist}
                    onChange={(e) => updateArtistList('remixers', index, e.target.value)}
                    placeholder="Remixer name"
                  />
                  {index === data.remixers.length - 1 && (
                    <Button type="button" size="sm" onClick={() => addArtist('remixers')}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeArtist('remixers', index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Release Details */}
      <Card>
        <CardHeader>
          <CardTitle>Release Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="releaseDate">Release Date *</Label>
              <Input
                id="releaseDate"
                type="date"
                value={data.releaseDate}
                onChange={(e) => updateData({ releaseDate: e.target.value })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rerelease"
                checked={data.isReRelease}
                onCheckedChange={(checked) => updateData({ isReRelease: !!checked })}
              />
              <Label htmlFor="rerelease">Is this a re-release?</Label>
            </div>
          </div>
          
          {data.isReRelease && (
            <div>
              <Label htmlFor="originalDate">Original Release Date *</Label>
              <Input
                id="originalDate"
                type="date"
                value={data.originalReleaseDate || ''}
                onChange={(e) => updateData({ originalReleaseDate: e.target.value })}
              />
            </div>
          )}

          <div>
            <Label>Release Artwork</Label>
            <div className="space-y-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-border hover:border-foreground/20'
                }`}
                onClick={triggerFileInput}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground">
                  {data.artwork ? data.artwork.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-muted-foreground">JPEG, PNG (Max 30MB)</p>
                <input
                  id="artwork-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
              
              {artworkPreview && (
                <div className="flex justify-center">
                  <div className="max-w-xs">
                    <img 
                      src={artworkPreview} 
                      alt="Artwork preview" 
                      className="w-full h-auto rounded-lg border"
                    />
                    <p className="text-sm text-muted-foreground text-center mt-2">Artwork Preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Label & Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Label & Catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="labelName">Label Name *</Label>
            <Input
              id="labelName"
              value={data.labelName}
              onChange={(e) => updateData({ labelName: e.target.value })}
              placeholder="Record label name"
            />
          </div>
          
          <div>
            <Label htmlFor="albumGenre">Album Genre *</Label>
            <Select value={data.albumGenre} onValueChange={(value) => updateData({ albumGenre: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="catalogNumber">Catalog Number</Label>
              <Input
                id="catalogNumber"
                value={data.catalogNumber || ''}
                onChange={(e) => updateData({ catalogNumber: e.target.value })}
                placeholder="e.g., ABC-123"
              />
            </div>
            <div>
              <Label htmlFor="upc">UPC (Barcode)</Label>
              <Input
                id="upc"
                value={data.upc || ''}
                onChange={(e) => updateData({ upc: e.target.value })}
                placeholder="12 or 13 digits"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Copyright */}
      <Card>
        <CardHeader>
          <CardTitle>Copyright Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="albumCLine">Album C Line *</Label>
            <Input
              id="albumCLine"
              value={data.albumCLine}
              onChange={(e) => updateData({ albumCLine: e.target.value })}
              placeholder="℗ 2025 Example Records"
            />
          </div>
          <div>
            <Label htmlFor="albumPLine">Album P Line *</Label>
            <Input
              id="albumPLine"
              value={data.albumPLine}
              onChange={(e) => updateData({ albumPLine: e.target.value })}
              placeholder="© 2025 Example Records"
            />
          </div>
        </CardContent>
      </Card>

      {/* Territory Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Territories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="worldwide"
              checked={data.isWorldwide}
              onCheckedChange={(checked) => updateData({ isWorldwide: !!checked })}
            />
            <Label htmlFor="worldwide">Release worldwide</Label>
          </div>
          
          {!data.isWorldwide && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Territory Mode:</Label>
                <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-muted rounded-full p-1">
                    <div 
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                        data.territoryMode === 'include' 
                          ? 'bg-green-500 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => updateData({ territoryMode: 'include' })}
                    >
                      Include
                    </div>
                    <div 
                      className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                        data.territoryMode === 'exclude' 
                          ? 'bg-red-500 text-white shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => updateData({ territoryMode: 'exclude' })}
                    >
                      Exclude
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{getTerritoryHelperText()}</p>
                </div>
              </div>
              
              <div>
                <Label>Quick Select by Continent:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.keys(continents).map(continent => (
                    <Button
                      key={continent}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addContinent(continent)}
                    >
                      {continent}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Add Individual Territory:</Label>
                <Select onValueChange={addIndividualTerritory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCountries.map(country => (
                      <SelectItem 
                        key={country} 
                        value={country}
                        disabled={data.territories.includes(country)}
                      >
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {data.territories.length > 0 && (
                <div>
                  <Label>Selected Territories:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.territories.map(territory => (
                      <Badge 
                        key={territory} 
                        variant="secondary"
                        className={data.territoryMode === 'include' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {territory}
                        <button
                          type="button"
                          onClick={() => removeTerritory(territory)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReleaseInfo;
