export interface User {
  id: string;
  uid?: string;
  email: string;
  name: string;
  avatar?: string;
  emailNotif?: boolean;
  streamAlerts?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface StreamConfig {
  id: string;
  userId: string;
  streamName: string;
  destinationUrl: string;
  streamKey: string;
  channelId?: string;
  sourceType: 'camera' | 'screen' | 'video' | 'playlist';
  resolution: '720p' | '1080p';
  fps: '30' | '60';
  bitrate: string;
  audioBitrate: string;
  isLandscape: boolean;
  isLive: boolean;
  status: 'Ready' | 'Connecting' | 'Live' | 'Stopped' | 'Error';
  duration: number;
  health: 'Excellent' | 'Good' | 'Poor' | 'Disconnected';
}

export interface VideoItem {
  id: string;
  userId: string;
  title: string;
  filename: string;
  thumbnail: string;
  duration: string;
  size: string;
  uploadedAt: string;
}

export interface UpcomingStream {
  id: string;
  userId: string;
  title: string;
  scheduledTime: string;
  destination: string;
  category: string;
}

export interface StreamHistoryRecord {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: string;
  destination: string;
  status: 'Completed' | 'Interrupted' | 'Failed';
  recordingUrl?: string;
}

export interface PlaylistConfig {
  userId: string;
  loopEnabled: boolean;
  selectedVideoIds: string[];
}

export interface YouTubeOAuthCredential {
  provider: 'youtube';
  userId: string;
  channelId: string;
  channelTitle: string;
  channelEmail: string;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  scopes: string[];
  expiresAt: number;
  isConnected: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ActiveTab =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'stream_source'
  | 'stream_config'
  | 'video_library'
  | 'playlist_loop'
  | 'upcoming_streams'
  | 'stream_history'
  | 'settings'
  | 'help_support';

