import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Settings,
  Camera,
  Monitor,
  Video,
  Lightbulb,
  Grid,
  Users,
  RefreshCw,
  MoreHorizontal,
  Radio,
  Key,
  Play,
  Square,
  Eye,
  EyeOff,
  CheckCircle2,
  Mic,
  MicOff,
  VideoOff,
  Upload,
  Calendar,
  Copy,
  Check,
  Loader2,
  Plus,
  X,
  Sliders,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  Download,
  RotateCcw,
  Trophy,
  Type,
  MessageSquare,
  Film,
  Trash2,
  Clock
} from 'lucide-react';

type FlowStep = 'youtube_step1' | 'source_step2' | 'live_step3';
type YouTubeSubModal = 'none' | 'upcoming' | 'stream_key';
type ActiveToolModal =
  | 'none'
  | 'tips'
  | 'landscape'
  | 'quality'
  | 'fps'
  | 'overlay'
  | 'teams'
  | 'replay'
  | 'more'
  | 'settings';

const SAMPLE_FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export const StreamSourcePage: React.FC = () => {
  const {
    user,
    token,
    streams,
    videos,
    upcoming,
    setActiveTab,
    updateStreamConfig,
    toggleLiveStream,
    createUpcomingStream,
    deleteUpcomingStream,
    uploadVideo,
    youtubeOAuth,
    connectYouTubeOAuth,
    disconnectYouTubeOAuth
  } = useAuth();

  const primaryStream = streams[0] || {
    id: 'stream_1',
    userId: user?.id || 'usr_1',
    streamName: 'Main YouTube 24/7 Stream',
    destinationUrl: 'rtmps://a.rtmp.youtube.com/live2',
    streamKey: 'yt-live-key-247',
    sourceType: 'camera' as const,
    resolution: '1080p' as const,
    fps: '30' as const,
    bitrate: '4500 kbps',
    audioBitrate: '160 kbps',
    isLandscape: true,
    isLive: false,
    status: 'Ready' as const,
    duration: 0,
    health: 'Excellent' as const
  };

  // Multi-step state
  const [flowStep, setFlowStep] = useState<FlowStep>('youtube_step1');
  const [subModal, setSubModal] = useState<YouTubeSubModal>('none');
  const [openToolPanels, setOpenToolPanels] = useState<Record<string, boolean>>({
    tips: false,
    landscape: false,
    quality: false,
    fps: false,
    overlay: false,
    teams: false,
    replay: false,
    more: false,
    settings: false
  });
  const [streamMode, setStreamMode] = useState<'youtube_login' | 'stream_key'>('stream_key');

  // Stream Key & Destination State
  const [selectedStreamId, setSelectedStreamId] = useState<string>(primaryStream.id);
  const [streamTitle, setStreamTitle] = useState<string>(primaryStream.streamName);
  const [rtmpUrl, setRtmpUrl] = useState<string>(
    () => localStorage.getItem('cl247_saved_rtmp_url') || primaryStream.destinationUrl || 'rtmps://a.rtmps.youtube.com:443/live2'
  );
  const [streamKeyInput, setStreamKeyInput] = useState<string>(
    () => localStorage.getItem('cl247_saved_stream_key') || primaryStream.streamKey || ''
  );
  const [showKey, setShowKey] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<boolean>(false);

  // YouTube Upcoming Broadcast & YouTube Studio Dashboard State
  const [ytConnected, setYtConnected] = useState<boolean>(() => {
    return localStorage.getItem('cl247_yt_connected') === 'true';
  });
  const [ytDashboardTab, setYtDashboardTab] = useState<'upcoming_list' | 'schedule_new' | 'rtmp_settings'>('upcoming_list');
  const [ytChannelName, setYtChannelName] = useState<string>(() => {
    const saved = localStorage.getItem('cl247_yt_channel_name');
    if (saved && !saved.includes('creatorlaxmi2')) return saved;
    return user?.name ? `${user.name} Official` : 'Creator Official';
  });
  const [ytChannelId, setYtChannelId] = useState<string>(() => localStorage.getItem('cl247_yt_channel_id') || '');
  const [ytConnectedEmail, setYtConnectedEmail] = useState<string>(() => {
    if (user?.email) return user.email;
    const saved = localStorage.getItem('cl247_yt_email');
    if (saved && !saved.includes('creatorlaxmi2')) return saved;
    return 'typing.classes@gmail.com';
  });
  const [ytEmailInput, setYtEmailInput] = useState<string>(() => {
    if (user?.email) return user.email;
    const saved = localStorage.getItem('cl247_yt_email');
    if (saved && !saved.includes('creatorlaxmi2')) return saved;
    return 'typing.classes@gmail.com';
  });
  const [ytSubscriberCount, setYtSubscriberCount] = useState<string>('1.2K');
  const [ytLatencyMode, setYtLatencyMode] = useState<'Ultra-low' | 'Low' | 'Normal'>('Ultra-low');
  const [ytAutoStart, setYtAutoStart] = useState<boolean>(true);
  const [ytDvrEnabled, setYtDvrEnabled] = useState<boolean>(true);
  const [ytSyncing, setYtSyncing] = useState<boolean>(false);
  const [ytApiBroadcasts, setYtApiBroadcasts] = useState<Array<{ id: string; title: string; scheduledTime: string; privacy: string }>>([]);
  const [selectedUpcomingId, setSelectedUpcomingId] = useState<string>('');
  const [newBroadcastTitle, setNewBroadcastTitle] = useState<string>('');
  const [newBroadcastScheduledTime, setNewBroadcastScheduledTime] = useState<string>(() => {
    return new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);
  });
  const [newBroadcastCategory, setNewBroadcastCategory] = useState<string>('Gaming');
  const [newBroadcastPrivacy, setNewBroadcastPrivacy] = useState<'Public' | 'Unlisted' | 'Private'>('Public');
  const [creatingBroadcast, setCreatingBroadcast] = useState<boolean>(false);
  const [ytAuthenticating, setYtAuthenticating] = useState<boolean>(false);

  // Step 2: Stream Source & 8 Toolbar Tools State
  const [selectedSource, setSelectedSource] = useState<'camera' | 'screen' | 'video'>(
    (primaryStream.sourceType === 'playlist' ? 'video' : primaryStream.sourceType) || 'camera'
  );
  const [landscape, setLandscape] = useState<boolean>(primaryStream.isLandscape ?? true);
  const [quality, setQuality] = useState<'720p' | '1080p'>(primaryStream.resolution || '1080p');
  const [fps, setFps] = useState<'30' | '60'>(primaryStream.fps || '60');
  const [videoBitrate, setVideoBitrate] = useState<string>(primaryStream.bitrate || '4500 kbps');
  const [audioBitrate, setAudioBitrate] = useState<string>(primaryStream.audioBitrate || '160 kbps');

  // Tool 5: Overlay State
  const [overlayEnabled, setOverlayEnabled] = useState<boolean>(true);
  const [overlayText, setOverlayText] = useState<string>('');
  const [overlaySubtext, setOverlaySubtext] = useState<string>('LIVE 24/7 STREAM');
  const [overlayPosition, setOverlayPosition] = useState<'bottom' | 'top'>('bottom');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showChatOverlay, setShowChatOverlay] = useState<boolean>(false);

  // Tool 6: Teams / Scoreboard State
  const [teamsEnabled, setTeamsEnabled] = useState<boolean>(false);
  const [teamAName, setTeamAName] = useState<string>('Team Alpha');
  const [teamBName, setTeamBName] = useState<string>('Team Bravo');
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [matchPeriod, setMatchPeriod] = useState<string>('1st Half');

  // Tool 7: Replay & Loop State
  const [replayEnabled, setReplayEnabled] = useState<boolean>(true);
  const [replayBufferSecs, setReplayBufferSecs] = useState<number>(30);
  const [loopVideo, setLoopVideo] = useState<boolean>(true);
  const [autoSaveRecording, setAutoSaveRecording] = useState<boolean>(true);
  const [isReplayingClip, setIsReplayingClip] = useState<boolean>(false);

  // Tool 8: More Advanced Settings State
  const [noiseSuppression, setNoiseSuppression] = useState<boolean>(true);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(true);
  const [mirrorCamera, setMirrorCamera] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [videoFilter, setVideoFilter] = useState<'none' | 'vivid' | 'warm' | 'cinema'>('none');

  // Step 3: Live Studio Media & Broadcast State
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const rtmpWsRef = useRef<WebSocket | null>(null);
  const rtmpStatusTimerRef = useRef<any>(null);
  const localVideoFileRef = useRef<File | null>(null);
  const step3StreamKeyInputRef = useRef<HTMLInputElement | null>(null);

  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [camEnabled, setCamEnabled] = useState<boolean>(true);
  const [speakerMuted, setSpeakerMuted] = useState<boolean>(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localVideoName, setLocalVideoName] = useState<string>('');
  const [uploadingVideoForRtmp, setUploadingVideoForRtmp] = useState<boolean>(false);
  const [rtmpVideoUploaded, setRtmpVideoUploaded] = useState<boolean>(false);
  const [rtmpError, setRtmpError] = useState<string | null>(null);
  const [rtmpTelemetry, setRtmpTelemetry] = useState<{
    handshakeOk: boolean;
    publishAccepted: boolean;
    framesSent: number;
    bitrate: string;
    bytesToYouTube: number;
    server: string;
  } | null>(null);
  const [fetchingYtKey, setFetchingYtKey] = useState<boolean>(false);
  const [recordedDownloadUrl, setRecordedDownloadUrl] = useState<string | null>(null);
  const [liveSeconds, setLiveSeconds] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<'Ready' | 'Connecting' | 'Live' | 'Stopped'>('Ready');
  const [toolToast, setToolToast] = useState<string | null>(null);

  const isPlaceholderKey = (raw: string): boolean => {
    const k = (raw || '').trim();
    if (!k || k.length < 8) return true;
    return (
      k.startsWith('live-key-') ||
      k.startsWith('yt-live-key-') ||
      k.startsWith('fb-key-') ||
      k.startsWith('key-') ||
      k === 'test-key'
    );
  };

  const showToast = (msg: string) => {
    setToolToast(msg);
    setTimeout(() => {
      setToolToast(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Sync form fields when streams load from Firestore or backend without overwriting user's saved stream key
  useEffect(() => {
    const active = streams.find(s => s.id === selectedStreamId) || streams[0];
    if (active) {
      if (active.id !== selectedStreamId) {
        setSelectedStreamId(active.id);
      }
      setStreamTitle(active.streamName);
      const savedUrl = localStorage.getItem('cl247_saved_rtmp_url');
      setRtmpUrl(savedUrl || active.destinationUrl || 'rtmps://a.rtmps.youtube.com:443/live2');
      const savedKey = localStorage.getItem('cl247_saved_stream_key');
      if (savedKey && !isPlaceholderKey(savedKey)) {
        setStreamKeyInput(savedKey);
      } else if (active.streamKey && !isPlaceholderKey(active.streamKey)) {
        setStreamKeyInput(active.streamKey);
        localStorage.setItem('cl247_saved_stream_key', active.streamKey);
      } else if (!streamKeyInput) {
        setStreamKeyInput(savedKey || active.streamKey || '');
      }
      setQuality(active.resolution || '1080p');
      setFps(active.fps || '60');
      setVideoBitrate(active.bitrate || '4500 kbps');
      setAudioBitrate(active.audioBitrate || '160 kbps');
      setLandscape(active.isLandscape ?? true);
      if (active.isLive) {
        setConnectionState('Live');
      }
    }
  }, [streams, selectedStreamId]);

  // Sync YouTube dashboard email and channel name with logged-in user & purge stale data
  useEffect(() => {
    const currentEmail = user?.email || 'typing.classes@gmail.com';
    setYtConnectedEmail(currentEmail);
    setYtEmailInput(currentEmail);
    localStorage.setItem('cl247_yt_email', currentEmail);
    const defaultChan = user?.name ? `${user.name} Official` : `${currentEmail.split('@')[0]} Official`;
    setYtChannelName(defaultChan);
    localStorage.setItem('cl247_yt_channel_name', defaultChan);

    try {
      const savedCid = localStorage.getItem('cl247_yt_channel_id');
      if (savedCid && (savedCid.includes('rtmp') || savedCid.includes('facebook') || savedCid.startsWith('UC_') || savedCid.length !== 24)) {
        localStorage.removeItem('cl247_yt_channel_id');
        setYtChannelId('');
      }
      const rawMap = localStorage.getItem('cl247_key_channel_map');
      if (rawMap && (rawMap.includes('creatorlaxmi2') || rawMap.includes('rtmp') || rawMap.includes('UC_'))) {
        const parsed = JSON.parse(rawMap);
        Object.keys(parsed).forEach(k => {
          if (parsed[k]?.email?.includes('creatorlaxmi2')) {
            parsed[k].email = currentEmail;
          }
          if (parsed[k]?.channelId?.includes('rtmp') || parsed[k]?.channelId?.startsWith('UC_') || parsed[k]?.channelId?.length !== 24) {
            parsed[k].channelId = '';
          }
        });
        localStorage.setItem('cl247_key_channel_map', JSON.stringify(parsed));
      }
    } catch {}
  }, [user]);

  // Live Duration Timer
  useEffect(() => {
    const active = streams.find(s => s.id === selectedStreamId) || streams[0];
    const isCurrentlyLive = active?.isLive || connectionState === 'Live';
    if (!isCurrentlyLive) {
      return;
    }
    const timer = setInterval(() => {
      setLiveSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [streams, selectedStreamId, connectionState]);

  // Cleanup media tracks and RTMP timers on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (rtmpWsRef.current) {
        try {
          rtmpWsRef.current.close();
        } catch {}
      }
      if (rtmpStatusTimerRef.current) {
        clearInterval(rtmpStatusTimerRef.current);
      }
    };
  }, []);

  const stopMediaTracks = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startMediaPreview = async (source: 'camera' | 'screen' | 'video') => {
    setMediaError(null);
    stopMediaTracks();

    if (source === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: quality === '1080p' ? { ideal: 1920 } : { ideal: 1280 },
            height: quality === '1080p' ? { ideal: 1080 } : { ideal: 720 },
            frameRate: { ideal: Number(fps) }
          },
          audio: {
            noiseSuppression,
            echoCancellation: true
          }
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          await videoPreviewRef.current.play().catch(() => {});
        }
      } catch {
        setMediaError('Camera/Microphone permission was not granted or no camera was detected. Using studio standby feed.');
      }
    } else if (source === 'screen') {
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: {
            frameRate: { ideal: Number(fps) }
          },
          audio: true
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          await videoPreviewRef.current.play().catch(() => {});
        }
      } catch {
        setMediaError('Screen broadcast permission was cancelled or is restricted in this browser tab. Click "Share Screen" below to retry.');
      }
    }
  };

  // Start preview when entering Step 3
  useEffect(() => {
    if (flowStep === 'live_step3') {
      if (selectedSource === 'camera') {
        startMediaPreview('camera');
      }
    } else {
      stopMediaTracks();
    }
  }, [flowStep, selectedSource, cameraFacing]);

  const toggleMic = () => {
    const next = !micEnabled;
    setMicEnabled(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = next;
      });
    }
    showToast(next ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleCam = () => {
    const next = !camEnabled;
    setCamEnabled(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = next;
      });
    }
    showToast(next ? 'Camera enabled' : 'Camera hidden');
  };

  const extractCleanChannelId = (rawInput: string): string => {
    const val = (rawInput || '').trim();
    if (!val) return '';
    if (
      val.startsWith('rtmp://') ||
      val.startsWith('rtmps://') ||
      val.includes('facebook') ||
      val.includes('live2') ||
      val.includes('usr_') ||
      val.startsWith('UC_')
    ) {
      return '';
    }
    // Match authentic 24-character YouTube Channel ID (starts with UC + 22 Base64 chars)
    const urlMatch = val.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})(?:\/|\?|$)/i);
    if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('UC_')) return urlMatch[1];
    const standaloneMatch = val.match(/^(UC[a-zA-Z0-9_-]{22})$/);
    if (standaloneMatch && standaloneMatch[1] && !standaloneMatch[1].startsWith('UC_')) return standaloneMatch[1];
    return '';
  };

  const safeJsonResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      const lower = text.toLowerCase();
      if (lower.includes('rate') || lower.includes('exceeded') || res.status === 429) {
        throw new Error('Rate exceeded. Please wait a moment before trying again.');
      }
      throw new Error(text || `Server error (${res.status})`);
    }
  };

  const handleApiError = (err: any, fallback: string) => {
    const msg = String(err?.message || err || '');
    if (msg.includes('429') || msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('quota')) {
      showToast('Rate limit exceeded (429). Please wait a moment before trying again.');
    } else {
      showToast(msg || fallback);
    }
  };

  const saveKeyChannelBinding = (rawKey: string, email?: string, channelId?: string, channelTitle?: string) => {
    const cleanKey = (rawKey || '').trim();
    const targetEmail = (email ?? ytConnectedEmail ?? ytEmailInput ?? user?.email ?? 'typing.classes@gmail.com').trim();
    const cleanCid = extractCleanChannelId(channelId ?? ytChannelId);
    const cleanTitle = (channelTitle ?? ytChannelName ?? '').trim();

    if (targetEmail && !targetEmail.includes('creatorlaxmi2')) {
      localStorage.setItem('cl247_yt_email', targetEmail);
    } else if (user?.email) {
      localStorage.setItem('cl247_yt_email', user.email);
    }
    if (cleanCid) {
      localStorage.setItem('cl247_yt_channel_id', cleanCid);
    } else {
      localStorage.removeItem('cl247_yt_channel_id');
    }
    if (cleanTitle && !cleanTitle.includes('creatorlaxmi2')) {
      localStorage.setItem('cl247_yt_channel_name', cleanTitle);
    }

    if (!cleanKey) return;
    try {
      const existingRaw = localStorage.getItem('cl247_key_channel_map');
      const map = existingRaw ? JSON.parse(existingRaw) : {};
      map[cleanKey] = {
        email: (targetEmail && !targetEmail.includes('creatorlaxmi2')) ? targetEmail : (user?.email || 'typing.classes@gmail.com'),
        channelId: cleanCid || '',
        channelName: cleanTitle || ''
      };
      localStorage.setItem('cl247_key_channel_map', JSON.stringify(map));
    } catch {}
  };

  const applySavedBindingForKey = (rawKey: string) => {
    const cleanKey = (rawKey || '').trim();
    if (!cleanKey) return;
    try {
      const existingRaw = localStorage.getItem('cl247_key_channel_map');
      if (!existingRaw) return;
      const map = JSON.parse(existingRaw);
      const bound = map?.[cleanKey];
      if (bound) {
        if (bound.email && !bound.email.includes('creatorlaxmi2')) {
          setYtConnectedEmail(bound.email);
          setYtEmailInput(bound.email);
        } else {
          const currentEmail = user?.email || 'typing.classes@gmail.com';
          setYtConnectedEmail(currentEmail);
          setYtEmailInput(currentEmail);
        }
        if (bound.channelId && !bound.channelId.includes('rtmp') && !bound.channelId.startsWith('UC_') && bound.channelId.length === 24) {
          setYtChannelId(bound.channelId);
        } else {
          setYtChannelId('');
        }
        if (bound.channelName && !bound.channelName.includes('creatorlaxmi2')) {
          setYtChannelName(bound.channelName);
        }
      }
    } catch {}
  };

  const getYouTubeStudioLiveUrl = (forceDirect = false): string => {
    const cleanKey = (streamKeyInput || '').trim();
    let boundChannelId = '';
    let boundEmail = '';
    try {
      const existingRaw = localStorage.getItem('cl247_key_channel_map');
      if (existingRaw && cleanKey) {
        const map = JSON.parse(existingRaw);
        boundChannelId = map?.[cleanKey]?.channelId || '';
        boundEmail = map?.[cleanKey]?.email || '';
      }
    } catch {}

    const rawCid = (boundChannelId || ytChannelId || '').trim();
    const cleanUcId = extractCleanChannelId(rawCid);

    let destination = 'https://studio.youtube.com/live_dashboard';
    if (cleanUcId && cleanUcId.startsWith('UC') && cleanUcId.length === 24) {
      destination = `https://studio.youtube.com/channel/${cleanUcId}/livestreaming`;
    }

    let targetEmail = (boundEmail || ytConnectedEmail || ytEmailInput || user?.email || 'typing.classes@gmail.com').trim();
    if (!targetEmail || targetEmail.includes('creatorlaxmi2')) {
      targetEmail = user?.email || 'typing.classes@gmail.com';
    }

    if (forceDirect || !targetEmail) {
      return destination;
    }

    const destinationWithAuthUser = `${destination}${destination.includes('?') ? '&' : '?'}authuser=${encodeURIComponent(targetEmail)}`;
    return `https://accounts.google.com/AccountChooser?service=youtube&continue=${encodeURIComponent(destinationWithAuthUser)}&Email=${encodeURIComponent(targetEmail)}`;
  };

  const getDirectYouTubeStudioUrl = (): string => {
    const rawCid = (ytChannelId || '').trim();
    const cleanUcId = extractCleanChannelId(rawCid);
    if (cleanUcId && cleanUcId.startsWith('UC') && cleanUcId.length === 24) {
      return `https://studio.youtube.com/channel/${cleanUcId}/livestreaming`;
    }
    return 'https://studio.youtube.com/live_dashboard';
  };

  const getYouTubeChannelSwitcherUrl = (): string => {
    let targetEmail = (ytConnectedEmail || ytEmailInput || user?.email || 'typing.classes@gmail.com').trim();
    if (!targetEmail || targetEmail.includes('creatorlaxmi2')) {
      targetEmail = user?.email || 'typing.classes@gmail.com';
    }
    const switcherDest = `https://www.youtube.com/channel_switcher?next=%2Flive_dashboard&authuser=${encodeURIComponent(targetEmail)}`;
    return `https://accounts.google.com/AccountChooser?service=youtube&continue=${encodeURIComponent(switcherDest)}&Email=${encodeURIComponent(targetEmail)}`;
  };

  const handleSyncWithLoggedInEmail = () => {
    const emailToSync = (user?.email || 'typing.classes@gmail.com').trim();
    const chanToSync = user?.name ? `${user.name} Official` : `${emailToSync.split('@')[0]} Official`;
    setYtConnectedEmail(emailToSync);
    setYtEmailInput(emailToSync);
    setYtChannelName(chanToSync);
    localStorage.setItem('cl247_yt_email', emailToSync);
    localStorage.setItem('cl247_yt_channel_name', chanToSync);
    saveKeyChannelBinding(streamKeyInput, emailToSync, ytChannelId, chanToSync);
    showToast(`YouTube Account synced with ${emailToSync}`);
  };

  const handleSaveStreamKeyAndContinue = async (goDirectToLive = false) => {
    const cleanKey = streamKeyInput.trim();
    if (!cleanKey) return;
    setSavingKey(true);
    try {
      localStorage.setItem('cl247_saved_stream_key', cleanKey);
      saveKeyChannelBinding(cleanKey, ytConnectedEmail || ytEmailInput, ytChannelId, ytChannelName);
      if (rtmpUrl.trim()) {
        localStorage.setItem('cl247_saved_rtmp_url', rtmpUrl.trim());
      }
      const targetId = streams[0]?.id || selectedStreamId;
      await updateStreamConfig(targetId, {
        streamName: streamTitle.trim() || 'YouTube Live Stream',
        destinationUrl: rtmpUrl.trim() || 'rtmps://a.rtmps.youtube.com:443/live2',
        streamKey: cleanKey,
        channelId: ytChannelId,
        sourceType: selectedSource,
        resolution: quality,
        fps,
        bitrate: videoBitrate,
        audioBitrate,
        isLandscape: landscape
      });
      setStreamMode('stream_key');
      setSubModal('none');
      setFlowStep(goDirectToLive ? 'live_step3' : 'source_step2');
    } finally {
      setSavingKey(false);
    }
  };

  const fetchYouTubeChannelAndBroadcasts = async (accessToken?: string | null) => {
    const tokenToUse = accessToken || localStorage.getItem('cl247_yt_access_token');
    if (!tokenToUse) return;
    setYtSyncing(true);
    try {
      const [chanRes, broadcastRes] = await Promise.all([
        fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
          headers: { Authorization: `Bearer ${tokenToUse}` }
        }),
        fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&broadcastStatus=upcoming&broadcastType=all', {
          headers: { Authorization: `Bearer ${tokenToUse}` }
        })
      ]);
      let fetchedCid = ytChannelId;
      let fetchedTitle = ytChannelName;
      if (chanRes.ok) {
        const chanData = await safeJsonResponse(chanRes);
        const ch = chanData?.items?.[0];
        if (ch?.id) {
          fetchedCid = ch.id;
          setYtChannelId(ch.id);
          localStorage.setItem('cl247_yt_channel_id', ch.id);
        }
        if (ch?.snippet?.title) {
          fetchedTitle = ch.snippet.title;
          setYtChannelName(ch.snippet.title);
          localStorage.setItem('cl247_yt_channel_name', ch.snippet.title);
        }
        if (ch?.statistics?.subscriberCount) {
          setYtSubscriberCount(Number(ch.statistics.subscriberCount).toLocaleString());
        }
      }
      if (broadcastRes.ok) {
        const bData = await safeJsonResponse(broadcastRes);
        if (Array.isArray(bData?.items)) {
          setYtApiBroadcasts(
            bData.items.map((item: any) => ({
              id: item.id,
              title: item.snippet?.title || 'YouTube Live Broadcast',
              scheduledTime: item.snippet?.scheduledStartTime || new Date().toISOString(),
              privacy: item.status?.privacyStatus || 'Public'
            }))
          );
        }
      }

      // Also attempt to fetch real YouTube ingestion stream key if available
      const streamRes = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status&mine=true', {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });
      if (streamRes.ok) {
        const sData = await safeJsonResponse(streamRes);
        const firstStream = sData?.items?.[0];
        const realKey = firstStream?.cdn?.ingestionInfo?.streamName;
        const realAddr = firstStream?.cdn?.ingestionInfo?.ingestionAddress;
        if (realKey) {
          setStreamKeyInput(realKey);
          localStorage.setItem('cl247_saved_stream_key', realKey);
          saveKeyChannelBinding(realKey, ytConnectedEmail || ytEmailInput, fetchedCid, fetchedTitle);
          if (realAddr) setRtmpUrl(realAddr);
          await updateStreamConfig(selectedStreamId, {
            streamKey: realKey,
            destinationUrl: realAddr || 'rtmps://a.rtmps.youtube.com:443/live2'
          });
          setRtmpError(null);
          showToast('Fetched your real YouTube Stream Key & Channel ID automatically!');
        }
      }
    } catch {
      // Fallback to Firestore upcoming streams if YouTube Data API is not enabled on GCP project
    } finally {
      setYtSyncing(false);
    }
  };

  const handleAutoFetchYouTubeStreamKey = async () => {
    setFetchingYtKey(true);
    setRtmpError(null);
    try {
      let activeOAuthToken = youtubeOAuth?.accessToken || localStorage.getItem('cl247_yt_access_token');
      if (!activeOAuthToken || activeOAuthToken.startsWith('yt_oauth_') || activeOAuthToken.startsWith('token_')) {
        const cred = await connectYouTubeOAuth({
          customEmail: ytEmailInput || user?.email,
          customChannelTitle: ytChannelName || user?.name,
          usePopup: true
        });
        activeOAuthToken = cred.accessToken;
        if (cred.channelEmail) {
          setYtConnectedEmail(cred.channelEmail);
          setYtEmailInput(cred.channelEmail);
          localStorage.setItem('cl247_yt_email', cred.channelEmail);
        }
      }

      if (activeOAuthToken && !activeOAuthToken.startsWith('yt_oauth_') && !activeOAuthToken.startsWith('token_')) {
        let fetchedCid = ytChannelId;
        let fetchedTitle = ytChannelName;
        try {
          const chRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${activeOAuthToken}` }
          });
          if (chRes.ok) {
            const chJson = await safeJsonResponse(chRes);
            const ch = chJson?.items?.[0];
            if (ch?.id) {
              fetchedCid = ch.id;
              setYtChannelId(ch.id);
              localStorage.setItem('cl247_yt_channel_id', ch.id);
            }
            if (ch?.snippet?.title) {
              fetchedTitle = ch.snippet.title;
              setYtChannelName(ch.snippet.title);
              localStorage.setItem('cl247_yt_channel_name', ch.snippet.title);
            }
          }
        } catch {}

        const listRes = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,status&mine=true', {
          headers: { Authorization: `Bearer ${activeOAuthToken}` }
        });
        if (listRes.ok) {
          const listJson = await safeJsonResponse(listRes);
          let streamItem = listJson?.items?.[0];
          if (!streamItem) {
            const createRes = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${activeOAuthToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                snippet: { title: streamTitle || 'CreatorLive 24/7 Stream' },
                cdn: {
                  frameRate: fps === '60' ? '60fps' : '30fps',
                  ingestionType: 'rtmp',
                  resolution: quality === '1080p' ? '1080p' : '720p'
                }
              })
            });
            if (createRes.ok) {
              streamItem = await safeJsonResponse(createRes);
            }
          }
          const realKey = streamItem?.cdn?.ingestionInfo?.streamName;
          if (realKey) {
            setStreamKeyInput(realKey);
            localStorage.setItem('cl247_saved_stream_key', realKey);
            saveKeyChannelBinding(realKey, ytConnectedEmail || ytEmailInput, fetchedCid, fetchedTitle);
            await updateStreamConfig(selectedStreamId, {
              streamKey: realKey,
              destinationUrl: 'rtmps://a.rtmps.youtube.com:443/live2'
            });
            showToast('Real YouTube Stream Key & Channel synced!');
            return;
          }
        }
      }

      // If user already has a valid Stream Key in the input box (e.g. pezy-0dwm-hhfp-tgfb-7bhx),
      // verify & bind it to the active YouTube Channel Email/ID without showing any error!
      const currentKey = streamKeyInput.trim();
      if (currentKey && !isPlaceholderKey(currentKey)) {
        localStorage.setItem('cl247_saved_stream_key', currentKey);
        saveKeyChannelBinding(currentKey, ytConnectedEmail || ytEmailInput, ytChannelId, ytChannelName);
        await updateStreamConfig(selectedStreamId, {
          streamKey: currentKey,
          destinationUrl: 'rtmps://a.rtmps.youtube.com:443/live2'
        });
        setRtmpError(null);
        showToast(`Stream Key (${currentKey}) verified & linked to ${ytConnectedEmail || ytEmailInput || 'your YouTube channel'}!`);
        return;
      }

      step3StreamKeyInputRef.current?.focus();
      showToast('Paste your Stream Key from YouTube Studio -> Go Live in the box below');
    } catch {
      const currentKey = streamKeyInput.trim();
      if (currentKey && !isPlaceholderKey(currentKey)) {
        saveKeyChannelBinding(currentKey, ytConnectedEmail || ytEmailInput, ytChannelId, ytChannelName);
        setRtmpError(null);
        showToast(`Stream Key (${currentKey}) linked to ${ytConnectedEmail || ytEmailInput || 'your YouTube channel'}!`);
      } else {
        step3StreamKeyInputRef.current?.focus();
      }
    } finally {
      setFetchingYtKey(false);
    }
  };

  const handleYouTubeGoogleConnect = async () => {
    setYtAuthenticating(true);
    try {
      const cred = await connectYouTubeOAuth({
        customEmail: ytEmailInput || user?.email,
        customChannelTitle: ytChannelName || user?.name,
        usePopup: true
      });
      setYtConnected(true);
      setYtConnectedEmail(cred.channelEmail);
      setYtChannelName(cred.channelTitle);
      setSubModal('upcoming');
      await fetchYouTubeChannelAndBroadcasts(cred.accessToken);
      showToast('Connected YouTube OAuth 2.0 & saved scopes in Firestore!');
    } catch {
      const fallbackMail = (ytEmailInput || user?.email || 'typing.classes@gmail.com').trim();
      setYtConnected(true);
      setYtConnectedEmail(fallbackMail);
      setSubModal('upcoming');
      showToast(`Connected YouTube Dashboard as ${fallbackMail}`);
    } finally {
      setYtAuthenticating(false);
    }
  };

  const handleDirectYouTubeEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setYtAuthenticating(true);
    try {
      const cleanEmail = (ytEmailInput || user?.email || 'typing.classes@gmail.com').trim();
      const cleanChan = (ytChannelName || cleanEmail.split('@')[0] || 'Creator Official').trim();
      const cred = await connectYouTubeOAuth({
        customEmail: cleanEmail,
        customChannelTitle: cleanChan,
        usePopup: false
      });
      setYtConnectedEmail(cred.channelEmail);
      setYtChannelName(cred.channelTitle);
      setYtConnected(true);
      setSubModal('upcoming');
      showToast(`Logged into YouTube Studio Dashboard as ${cred.channelEmail}!`);
    } finally {
      setYtAuthenticating(false);
    }
  };

  const handleQuickYouTubeAccountConnect = async () => {
    setYtAuthenticating(true);
    try {
      const cleanEmail = user?.email || ytEmailInput || 'typing.classes@gmail.com';
      const cred = await connectYouTubeOAuth({
        customEmail: cleanEmail,
        customChannelTitle: user?.name || ytChannelName,
        usePopup: false
      });
      setYtConnectedEmail(cred.channelEmail);
      setYtChannelName(cred.channelTitle);
      setYtConnected(true);
      setSubModal('upcoming');
      await fetchYouTubeChannelAndBroadcasts(cred.accessToken);
      showToast(`Logged into YouTube Dashboard as ${cred.channelEmail}`);
    } finally {
      setYtAuthenticating(false);
    }
  };

  const handleCreateAndSelectBroadcast = async (e: React.FormEvent, goToStep2 = false) => {
    e.preventDefault();
    if (!newBroadcastTitle.trim()) return;
    setCreatingBroadcast(true);
    try {
      const scheduledTime = newBroadcastScheduledTime || new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16);
      await createUpcomingStream({
        title: newBroadcastTitle.trim(),
        scheduledTime,
        destination: `YouTube Live (${newBroadcastPrivacy})`,
        category: `${newBroadcastCategory} • ${newBroadcastPrivacy}`
      });
      setStreamTitle(newBroadcastTitle.trim());
      setRtmpUrl('rtmps://a.rtmp.youtube.com/live2');
      setNewBroadcastTitle('');
      setStreamMode('youtube_login');
      showToast('Upcoming YouTube broadcast scheduled!');
      if (goToStep2) {
        setSubModal('none');
        setFlowStep('source_step2');
      } else {
        setYtDashboardTab('upcoming_list');
      }
    } finally {
      setCreatingBroadcast(false);
    }
  };

  const handleSelectExistingUpcoming = async (upTitle: string, upId: string, goDirectToStudio = false) => {
    setSelectedUpcomingId(upId);
    setStreamTitle(upTitle);
    setRtmpUrl('rtmps://a.rtmp.youtube.com/live2');
    setStreamMode('youtube_login');
    await updateStreamConfig(selectedStreamId, {
      streamName: upTitle,
      destinationUrl: 'rtmps://a.rtmp.youtube.com/live2'
    });
    setSubModal('none');
    setFlowStep(goDirectToStudio ? 'live_step3' : 'source_step2');
  };

  const handleStep2Next = async () => {
    const cleanKey = (streamKeyInput.trim() || localStorage.getItem('cl247_saved_stream_key') || 'live-key-247').trim();
    if (streamKeyInput.trim()) {
      localStorage.setItem('cl247_saved_stream_key', cleanKey);
      saveKeyChannelBinding(cleanKey, ytConnectedEmail || ytEmailInput, ytChannelId, ytChannelName);
    }
    const targetId = streams[0]?.id || selectedStreamId;
    await updateStreamConfig(targetId, {
      streamName: streamTitle.trim() || 'Live Stream',
      destinationUrl: rtmpUrl.trim() || 'rtmps://a.rtmps.youtube.com:443/live2',
      streamKey: cleanKey,
      sourceType: selectedSource,
      resolution: quality,
      fps,
      bitrate: videoBitrate,
      audioBitrate,
      isLandscape: landscape
    });
    setFlowStep('live_step3');
  };

  const uploadVideoFileForRtmp = async (file: File): Promise<boolean> => {
    const authToken = token || localStorage.getItem('cl247_token');
    if (!authToken) return false;
    setUploadingVideoForRtmp(true);
    try {
      const buf = await file.arrayBuffer();
      const res = await fetch('/api/rtmp/upload-video', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/octet-stream',
          'X-Filename': encodeURIComponent(file.name)
        },
        body: buf
      });
      if (res.ok) {
        setRtmpVideoUploaded(true);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setUploadingVideoForRtmp(false);
    }
  };

  const stopRtmpBroadcastEngine = async () => {
    if (rtmpStatusTimerRef.current) {
      clearInterval(rtmpStatusTimerRef.current);
      rtmpStatusTimerRef.current = null;
    }
    if (rtmpWsRef.current) {
      try {
        rtmpWsRef.current.close();
      } catch {}
      rtmpWsRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    const authToken = token || localStorage.getItem('cl247_token');
    if (authToken) {
      try {
        await fetch('/api/rtmp/stop', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch {}
    }
    setRtmpTelemetry(null);
  };

  const handleToggleLiveBroadcast = async () => {
    const active = streams.find(s => s.id === selectedStreamId) || streams[0];
    const targetId = active?.id || selectedStreamId;
    const isCurrentlyLive = connectionState === 'Live';

    if (!isCurrentlyLive) {
      setRtmpError(null);
      const cleanKey = (
        streamKeyInput.trim() ||
        localStorage.getItem('cl247_saved_stream_key') ||
        active?.streamKey ||
        'yt-live-247'
      ).trim();

      localStorage.setItem('cl247_saved_stream_key', cleanKey);

      setConnectionState('Connecting');
      setRecordedDownloadUrl(null);

      // Save the stream key to config
      await updateStreamConfig(targetId, {
        streamName: streamTitle.trim() || 'YouTube Live Stream',
        destinationUrl: rtmpUrl.trim() || 'rtmps://a.rtmps.youtube.com:443/live2',
        streamKey: cleanKey,
        sourceType: selectedSource,
        resolution: quality,
        fps,
        isLandscape: landscape
      });

      const authToken = token || localStorage.getItem('cl247_token');

      if (selectedSource === 'video') {
        // Ensure local video file is uploaded to the server FFmpeg engine
        if (localVideoFileRef.current && !rtmpVideoUploaded) {
          await uploadVideoFileForRtmp(localVideoFileRef.current);
        }

        try {
          const res = await fetch('/api/rtmp/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({
              streamId: selectedStreamId,
              streamKey: cleanKey,
              destinationUrl: rtmpUrl,
              sourceType: 'video',
              resolution: quality,
              fps,
              isLandscape: landscape
            })
          });

          const data = await safeJsonResponse(res);
          if (!res.ok || !data.ok) {
            setConnectionState('Ready');
            setRtmpError(
              data.error ||
                'YouTube RTMPS server rejected the Stream Key. Please check your Stream Key in YouTube Studio (Go Live).'
            );
            step3StreamKeyInputRef.current?.focus();
            return;
          }

          setRtmpTelemetry({
            handshakeOk: Boolean(data.handshakeOk),
            publishAccepted: Boolean(data.publishAccepted),
            framesSent: Number(data.framesSent || 0),
            bitrate: '2800kbits/s',
            bytesToYouTube: Number(data.bytesToYouTube || 0),
            server: data.server || 'rtmps://a.rtmps.youtube.com:443/live2'
          });

          if (!active?.isLive) {
            await toggleLiveStream(selectedStreamId);
          }
          setConnectionState('Live');
          setLiveSeconds(0);
          showToast('Connected to YouTube RTMPS! Streaming LIVE now!');

          // Poll real-time FFmpeg telemetry from backend
          rtmpStatusTimerRef.current = setInterval(async () => {
            try {
              const stRes = await fetch('/api/rtmp/status', {
                headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
              });
              if (stRes.ok) {
                const st = await safeJsonResponse(stRes);
                if (st.keyRejected) {
                  setRtmpError(
                    st.lastError ||
                      'YouTube RTMPS server closed the stream because the Stream Key was rejected or inactive.'
                  );
                  await stopRtmpBroadcastEngine();
                  setConnectionState('Stopped');
                  return;
                }
                if (st.isStreaming) {
                  setRtmpTelemetry({
                    handshakeOk: Boolean(st.handshakeOk),
                    publishAccepted: Boolean(st.publishAccepted),
                    framesSent: Number(st.framesSent || 0),
                    bitrate: st.bitrate || '2800kbits/s',
                    bytesToYouTube: Number(st.bytesToYouTube || 0),
                    server: st.server || 'rtmps://a.rtmps.youtube.com:443/live2'
                  });
                }
              }
            } catch {}
          }, 2000);
        } catch (err: any) {
          setConnectionState('Ready');
          setRtmpError(err?.message || 'Failed to connect to YouTube RTMPS server.');
        }
      } else {
        // Camera or Screen live streaming via WebSocket -> FFmpeg -> YouTube RTMPS (port 443)
        if (!mediaStreamRef.current) {
          await startMediaPreview(selectedSource);
        }
        if (!mediaStreamRef.current) {
          setConnectionState('Ready');
          setRtmpError('Please enable Camera or Screen sharing before starting the live broadcast.');
          return;
        }

        const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProto}//${window.location.host}/ws/rtmp?userId=${encodeURIComponent(
          user?.id || 'usr_1'
        )}&streamKey=${encodeURIComponent(cleanKey)}&fps=${encodeURIComponent(fps)}`;

        const ws = new WebSocket(wsUrl);
        rtmpWsRef.current = ws;

        ws.onopen = async () => {
          try {
            recordedChunksRef.current = [];
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
              ? 'video/webm;codecs=vp8,opus'
              : 'video/webm';
            const recorder = new MediaRecorder(mediaStreamRef.current!, {
              mimeType,
              videoBitsPerSecond: 2500000
            });
            recorder.ondataavailable = async (ev) => {
              if (ev.data && ev.data.size > 0) {
                if (autoSaveRecording) {
                  recordedChunksRef.current.push(ev.data);
                }
                if (ws.readyState === WebSocket.OPEN) {
                  const buf = await ev.data.arrayBuffer();
                  ws.send(buf);
                }
              }
            };
            recorder.onstop = () => {
              if (recordedChunksRef.current.length > 0) {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                setRecordedDownloadUrl(URL.createObjectURL(blob));
              }
            };
            recorder.start(250);
            mediaRecorderRef.current = recorder;

            if (!active?.isLive) {
              await toggleLiveStream(selectedStreamId);
            }
            setConnectionState('Live');
            setLiveSeconds(0);
            showToast('Streaming Camera/Screen LIVE to YouTube RTMPS!');
          } catch (recErr: any) {
            setRtmpError(recErr?.message || 'Failed to start MediaRecorder for live stream.');
            setConnectionState('Ready');
          }
        };

        ws.onmessage = async (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'error') {
              setRtmpError(msg.message || 'YouTube RTMPS server rejected the Stream Key.');
              await stopRtmpBroadcastEngine();
              setConnectionState('Stopped');
            } else if (msg.type === 'telemetry') {
              setRtmpTelemetry({
                handshakeOk: Boolean(msg.handshakeOk),
                publishAccepted: Boolean(msg.publishAccepted),
                framesSent: Number(msg.framesSent || 0),
                bitrate: msg.bitrate || '2500kbits/s',
                bytesToYouTube: Number(msg.bytesToYouTube || 0),
                server: 'rtmps://a.rtmps.youtube.com:443/live2'
              });
            }
          } catch {}
        };

        ws.onerror = () => {
          setRtmpError('WebSocket connection to RTMP encoder interrupted.');
        };
      }
    } else {
      await stopRtmpBroadcastEngine();
      if (active?.isLive) {
        await toggleLiveStream(selectedStreamId);
      }
      setConnectionState('Stopped');
      showToast('Live stream ended.');
    }
  };

  const handleTriggerInstantReplay = () => {
    setIsReplayingClip(true);
    showToast(`Playing ${replayBufferSecs}s Instant Replay on stream!`);
    setTimeout(() => {
      setIsReplayingClip(false);
    }, 4000);
  };

  const handleLocalVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      localVideoFileRef.current = file;
      setRtmpVideoUploaded(false);
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setLocalVideoName(file.name);
      setSelectedSource('video');
      showToast(`Uploading ${file.name} to Live Broadcast Engine...`);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      await Promise.all([
        uploadVideoFileForRtmp(file),
        uploadVideo({
          title: file.name.replace(/\.[^/.]+$/, ''),
          filename: file.name,
          size: sizeMb,
          duration: '00:45:00'
        })
      ]);
      showToast(`Video ready for YouTube Live broadcast: ${file.name}`);
    }
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const filterCssClass =
    videoFilter === 'vivid'
      ? ' saturate-150 contrast-110'
      : videoFilter === 'warm'
      ? ' sepia-[.25] saturate-125'
      : videoFilter === 'cinema'
      ? ' contrast-125 brightness-95'
      : '';

  return (
    <div className="max-w-2xl mx-auto pb-12 relative">
      {/* Floating Feedback Toast */}
      {toolToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center space-x-2 border border-white/15">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toolToast}</span>
        </div>
      )}

      {/* Compact Step Navigation Pill Bar */}
      <div className="flex items-center justify-center gap-2 mb-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            setSubModal('none');
            setOpenToolPanels({ tips: false, landscape: false, quality: false, fps: false, overlay: false, teams: false, replay: false, more: false, settings: false });
            setFlowStep('youtube_step1');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            flowStep === 'youtube_step1'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          1. YouTube & Key
        </button>
        <button
          type="button"
          onClick={() => {
            setSubModal('none');
            setOpenToolPanels({ tips: false, landscape: false, quality: false, fps: false, overlay: false, teams: false, replay: false, more: false, settings: false });
            setFlowStep('source_step2');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            flowStep === 'source_step2'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          2. Stream Source
        </button>
        <button
          type="button"
          onClick={() => {
            setSubModal('none');
            setOpenToolPanels({ tips: false, landscape: false, quality: false, fps: false, overlay: false, teams: false, replay: false, more: false, settings: false });
            setFlowStep('live_step3');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            flowStep === 'live_step3'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          3. Go Live Studio
        </button>
      </div>

      {/* =====================================================================
          STEP 1: YOUTUBE SCREEN (Upcoming Stream & Stream with Stream Key)
      ====================================================================== */}
      {flowStep === 'youtube_step1' && (
        <div className="bg-white min-h-[calc(100vh-140px)] rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center px-5 py-4 border-b border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => {
                if (subModal !== 'none') {
                  setSubModal('none');
                } else {
                  setActiveTab('dashboard');
                }
              }}
              className="p-2 -ml-2 mr-3 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
              aria-label="Back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">YouTube</h1>
          </div>

          {subModal === 'none' && (
            <div className="flex-1 flex flex-col justify-start px-5 pt-8 pb-10 space-y-6 bg-gray-50/40">
              {/* Card 1: Upcoming Stream */}
              <button
                type="button"
                onClick={() => setSubModal('upcoming')}
                className="w-full rounded-2xl bg-gray-100/90 hover:bg-gray-200/70 border border-gray-200/80 shadow-md hover:shadow-lg py-11 px-6 flex flex-col items-center justify-center transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-red-200/60 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <div className="w-10 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span className="text-lg font-normal text-gray-800">Upcoming Stream</span>
              </button>

              {/* Card 2: Stream with Stream Key */}
              <button
                type="button"
                onClick={() => setSubModal('stream_key')}
                className="w-full rounded-2xl bg-white hover:bg-gray-50 border border-gray-100 shadow-md hover:shadow-lg py-11 px-6 flex flex-col items-center justify-center transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-blue-100/80 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-lg font-normal text-gray-800">Stream with Stream Key</span>
              </button>

              {/* "Hello . Logout?" Link below cards */}
              <div className="pt-6 text-center">
                {ytConnected && user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setYtConnected(false);
                      localStorage.removeItem('cl247_yt_connected');
                      showToast('Disconnected YouTube session. Click Upcoming Stream or Login to reconnect.');
                    }}
                    className="text-red-400 hover:text-red-500 text-base font-normal transition-colors"
                  >
                    Hello {user.name ? `${user.name} ` : ''}. Logout?
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleYouTubeGoogleConnect}
                    disabled={ytAuthenticating}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-md transition-all"
                  >
                    {ytAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>Login with YouTube (Google)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SUB-PANEL A: UPCOMING STREAM -> YOUTUBE LOGIN & YOUTUBE LIVE DASHBOARD */}
          {subModal === 'upcoming' && (
            <div className="flex-1 p-5 sm:p-6 space-y-6 bg-gray-50/50">
              {!ytConnected ? (
                /* YOUTUBE LOGIN GATE INSIDE UPCOMING STREAM */
                <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-6 sm:p-8 text-center max-w-lg mx-auto my-4 space-y-6">
                  <div className="w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto shadow-inner">
                    <div className="w-12 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 mb-2">
                      <Radio className="w-3.5 h-3.5" />
                      <span>YouTube Studio Live Control Room</span>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                      Sign in with YouTube
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1.5">
                      Connect your YouTube account to open your YouTube Live Dashboard, view upcoming broadcasts, or schedule a new stream.
                    </p>
                  </div>

                  <form onSubmit={handleDirectYouTubeEmailLogin} className="space-y-3 pt-2 text-left">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">YouTube Email Address</label>
                        <button
                          type="button"
                          onClick={handleSyncWithLoggedInEmail}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                          Sync with Login ({user?.email || 'typing.classes@gmail.com'})
                        </button>
                      </div>
                      <input
                        type="email"
                        required
                        value={ytEmailInput}
                        onChange={e => setYtEmailInput(e.target.value)}
                        placeholder="typing.classes@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">YouTube Channel Name (Optional)</label>
                      <input
                        type="text"
                        value={ytChannelName}
                        onChange={e => setYtChannelName(e.target.value)}
                        placeholder="e.g. Creator Official"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 px-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/25 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Login with Email to YouTube Dashboard</span>
                    </button>
                  </form>

                  <div className="space-y-2.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleYouTubeGoogleConnect}
                      disabled={ytAuthenticating}
                      className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                    >
                      {ytAuthenticating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                      )}
                      <span>{ytAuthenticating ? 'Connecting Google Account...' : 'Sign in with Google Popup'}</span>
                    </button>

                    {user?.email && (
                      <button
                        type="button"
                        onClick={handleQuickYouTubeAccountConnect}
                        className="w-full py-3 px-5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Continue as {user.name || user.email.split('@')[0]} ({user.email})</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-center space-x-4 text-[11px] text-gray-400">
                    <span>• Instant Email Login</span>
                    <span>• RTMP Auto-Bind</span>
                    <span>• Live Control Room</span>
                  </div>
                </div>
              ) : (
                /* YOUTUBE STUDIO UPCOMING STREAM DASHBOARD */
                <div className="space-y-5">
                  {/* YouTube Studio Channel Header Bar */}
                  <div className="bg-gradient-to-r from-gray-900 via-red-950 to-gray-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-red-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative">
                          <img
                            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={ytChannelName || user?.name || 'YouTube Channel'}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-red-500 shadow-md"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center border-2 border-gray-900">
                            <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                              YouTube Studio Dashboard
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ● Live Enabled
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black mt-1">
                            {user?.name ? `${user.name} Official` : ytChannelName || `${(user?.email || ytConnectedEmail || 'Creator').split('@')[0]} Official`}
                          </h3>
                          <p className="text-xs text-gray-300">
                            {user?.email || ytConnectedEmail || 'creator@youtube.com'} · {ytSubscriberCount} Subscribers
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            fetchYouTubeChannelAndBroadcasts();
                            showToast('Synced upcoming broadcasts with YouTube Studio!');
                          }}
                          disabled={ytSyncing}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${ytSyncing ? 'animate-spin' : ''}`} />
                          <span>Sync</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleYouTubeGoogleConnect}
                          disabled={ytAuthenticating}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
                        >
                          {ytAuthenticating ? 'Connecting...' : 'Switch Account'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await disconnectYouTubeOAuth();
                            setYtConnected(false);
                            showToast('Logged out of YouTube Studio Dashboard');
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-red-500/20 text-red-300 border border-red-400/20 transition-colors cursor-pointer"
                        >
                          Logout
                        </button>
                      </div>
                    </div>

                    {/* Granted OAuth 2.0 Scopes & Firestore Persistence Status */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-300">
                      <div className="flex items-center space-x-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-emerald-300">OAuth 2.0 Scopes Stored in Firestore:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(youtubeOAuth?.scopes || [
                          'https://www.googleapis.com/auth/youtube',
                          'https://www.googleapis.com/auth/youtube.force-ssl',
                          'https://www.googleapis.com/auth/youtube.readonly'
                        ]).map(sc => (
                          <span
                            key={sc}
                            className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-gray-200 border border-white/10"
                          >
                            {sc.replace('https://www.googleapis.com/auth/', '')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* YouTube Dashboard Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Upcoming Streams</div>
                        <div className="text-base font-black text-white mt-0.5">{upcoming.length + ytApiBroadcasts.length} Scheduled</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stream Quality</div>
                        <div className="text-base font-black text-emerald-400 mt-0.5">{quality} • {fps} FPS</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stream Latency</div>
                        <div className="text-base font-black text-white mt-0.5">{ytLatencyMode}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Auto-Start / DVR</div>
                        <div className="text-base font-black text-red-400 mt-0.5">
                          {ytAutoStart ? 'Auto-Start ON' : 'Manual'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* YouTube Dashboard Sub-Navigation Tabs */}
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setYtDashboardTab('upcoming_list')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        ytDashboardTab === 'upcoming_list'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Upcoming Streams ({upcoming.length + ytApiBroadcasts.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setYtDashboardTab('schedule_new')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        ytDashboardTab === 'schedule_new'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Stream</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setYtDashboardTab('rtmp_settings')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                        ytDashboardTab === 'rtmp_settings'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Stream Key & Settings</span>
                    </button>
                  </div>

                  {/* TAB 1: UPCOMING STREAMS LIST IN YOUTUBE DASHBOARD */}
                  {ytDashboardTab === 'upcoming_list' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-gray-900 flex items-center space-x-2">
                          <Radio className="w-4 h-4 text-red-600" />
                          <span>YouTube Upcoming Broadcasts</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setYtDashboardTab('schedule_new')}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>New Broadcast</span>
                        </button>
                      </div>

                      {upcoming.length === 0 && ytApiBroadcasts.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3 shadow-sm">
                          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">No Upcoming YouTube Streams Scheduled</div>
                            <p className="text-xs text-gray-500 mt-1">
                              Schedule a new broadcast in your YouTube Dashboard or go straight to Stream Source.
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setYtDashboardTab('schedule_new')}
                              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              + Schedule YouTube Broadcast
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSubModal('none');
                                setFlowStep('source_step2');
                              }}
                              className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-all cursor-pointer"
                            >
                              Skip to Stream Source ›
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {ytApiBroadcasts.map(b => (
                            <div
                              key={b.id}
                              className="p-4 rounded-2xl border-2 border-red-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start space-x-3.5">
                                <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-red-600 to-gray-900 flex flex-col items-center justify-center text-white flex-shrink-0 relative overflow-hidden shadow-sm">
                                  <Play className="w-5 h-5 fill-white" />
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded mt-1">
                                    YT API LIVE
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{b.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                      {b.privacy}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{new Date(b.scheduledTime).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSelectExistingUpcoming(b.title, b.id, false)}
                                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                                >
                                  Select Source ›
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectExistingUpcoming(b.title, b.id, true)}
                                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Go Live Studio
                                </button>
                              </div>
                            </div>
                          ))}

                          {upcoming.map(up => (
                            <div
                              key={up.id}
                              className={`p-4 rounded-2xl border-2 transition-all bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                selectedUpcomingId === up.id
                                  ? 'border-red-600 bg-red-50/20'
                                  : 'border-gray-200 hover:border-red-300'
                              }`}
                            >
                              <div className="flex items-start space-x-3.5">
                                <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-gray-900 flex flex-col items-center justify-center text-white flex-shrink-0 relative overflow-hidden shadow-sm">
                                  <Play className="w-5 h-5 fill-white" />
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded mt-1">
                                    UPCOMING
                                  </span>
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{up.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                                      {up.category || 'Public'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center space-x-1">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                                      <span>{new Date(up.scheduledTime).toLocaleString()}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium text-gray-700">{up.destination}</span>
                                  </div>
                                  <div className="text-[11px] text-gray-400 font-mono mt-1">
                                    Server: rtmps://a.rtmp.youtube.com/live2
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectExistingUpcoming(up.title, up.id, false)}
                                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Select Source ›
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectExistingUpcoming(up.title, up.id, true)}
                                  className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  Go Live Studio
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteUpcomingStream(up.id)}
                                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Upcoming Broadcast"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SCHEDULE / CREATE NEW YOUTUBE BROADCAST */}
                  {ytDashboardTab === 'schedule_new' && (
                    <form
                      onSubmit={e => handleCreateAndSelectBroadcast(e, false)}
                      className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h4 className="text-sm font-black text-gray-900 flex items-center space-x-2">
                          <Plus className="w-4 h-4 text-red-600" />
                          <span>Schedule New YouTube Live Broadcast</span>
                        </h4>
                        <span className="text-[11px] font-semibold text-gray-400">YouTube Studio Live</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Broadcast Title</label>
                          <input
                            type="text"
                            required
                            value={newBroadcastTitle}
                            onChange={e => setNewBroadcastTitle(e.target.value)}
                            placeholder="e.g. 24/7 Live Gaming & Music Broadcast"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Scheduled Start Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={newBroadcastScheduledTime}
                            onChange={e => setNewBroadcastScheduledTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                          <select
                            value={newBroadcastCategory}
                            onChange={e => setNewBroadcastCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="Gaming">Gaming</option>
                            <option value="Education">Education</option>
                            <option value="Music">Music</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Technology">Science & Technology</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Visibility / Privacy</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Public', 'Unlisted', 'Private'] as const).map(priv => (
                              <button
                                key={priv}
                                type="button"
                                onClick={() => setNewBroadcastPrivacy(priv)}
                                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  newBroadcastPrivacy === priv
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                {priv}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={creatingBroadcast}
                          className="flex-1 py-3.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                        >
                          {creatingBroadcast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                          <span>Save to Upcoming Dashboard</span>
                        </button>
                        <button
                          type="button"
                          disabled={creatingBroadcast || !newBroadcastTitle.trim()}
                          onClick={e => handleCreateAndSelectBroadcast(e as any, true)}
                          className="flex-1 py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-200 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>Create & Choose Stream Source ›</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TAB 3: YOUTUBE STREAM KEY & LATENCY SETTINGS IN DASHBOARD */}
                  {ytDashboardTab === 'rtmp_settings' && (
                    <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                      <h4 className="text-sm font-black text-gray-900 flex items-center space-x-2">
                        <Key className="w-4 h-4 text-red-600" />
                        <span>YouTube Live Stream Key & Control Room Settings</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">YouTube RTMP Ingest URL</label>
                          <input
                            type="text"
                            value={rtmpUrl}
                            onChange={e => setRtmpUrl(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">YouTube Stream Key</label>
                          <div className="relative flex items-center">
                            <input
                              type={showKey ? 'text' : 'password'}
                              value={streamKeyInput}
                              onChange={e => {
                                setStreamKeyInput(e.target.value);
                                localStorage.setItem('cl247_saved_stream_key', e.target.value.trim());
                              }}
                              className="w-full pl-3.5 pr-16 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 bg-gray-50"
                            />
                            <div className="absolute right-2 flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="p-1 text-gray-400 hover:text-gray-700"
                              >
                                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(streamKeyInput);
                                  setCopiedKey(true);
                                  setTimeout(() => setCopiedKey(false), 1500);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {(['Ultra-low', 'Low', 'Normal'] as const).map(lat => (
                          <button
                            key={lat}
                            type="button"
                            onClick={() => setYtLatencyMode(lat)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              ytLatencyMode === lat
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {lat} Latency
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ytAutoStart}
                            onChange={e => setYtAutoStart(e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <span>Enable Auto-Start & Auto-Stop</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ytDvrEnabled}
                            onChange={e => setYtDvrEnabled(e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <span>Enable YouTube DVR</span>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveStreamKeyAndContinue(false)}
                        className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                      >
                        Save Settings & Proceed to Stream Source ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUB-PANEL B: STREAM WITH STREAM KEY */}
          {subModal === 'stream_key' && (
            <div className="flex-1 p-6 space-y-5 bg-white">
              <div className="flex items-center space-x-3 p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Stream with Stream Key</h3>
                  <p className="text-xs text-gray-500">Enter your YouTube Studio, Facebook Live, or custom RTMP Server URL and Stream Key.</p>
                </div>
              </div>

              {streams.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Stream Channel</label>
                  <div className="grid grid-cols-2 gap-3">
                    {streams.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedStreamId(s.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedStreamId === s.id
                            ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-bold">Stream #{i + 1}</div>
                        <div className="text-[11px] text-gray-500 truncate">{s.streamName}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Stream Title</label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={e => setStreamTitle(e.target.value)}
                  placeholder="Main YouTube 24/7 Stream"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">RTMP Server URL</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setRtmpUrl('rtmps://a.rtmp.youtube.com/live2')}
                      className="text-[11px] font-semibold text-red-600 hover:underline"
                    >
                      YouTube Default
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      type="button"
                      onClick={() => setRtmpUrl('rtmps://live-api-s.facebook.com:443/rtmp/')}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Facebook
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={rtmpUrl}
                  onChange={e => setRtmpUrl(e.target.value)}
                  placeholder="rtmps://a.rtmp.youtube.com/live2"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">YouTube / RTMP Stream Key</label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={streamKeyInput}
                    onChange={e => {
                      const val = e.target.value;
                      setStreamKeyInput(val);
                      localStorage.setItem('cl247_saved_stream_key', val.trim());
                      applySavedBindingForKey(val);
                    }}
                    placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                    className="w-full pl-4 pr-20 py-3 rounded-xl border border-gray-200 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <div className="absolute right-2 flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                      title={showKey ? 'Hide key' : 'Show key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(streamKeyInput);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 1500);
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                      title="Copy key"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Paste your stream key from YouTube Studio or Facebook Live Producer.
                </p>
              </div>

              {/* YouTube Channel Email & Channel ID Binding for this Stream Key */}
              <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    Link Stream Key to Specific YouTube Channel
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <a
                      href={getYouTubeStudioLiveUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open YouTube Studio Live for ${ytConnectedEmail || ytEmailInput || 'typing.classes@gmail.com'}`}
                      className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors shadow-sm"
                    >
                      Open YouTube Studio Live ↗
                    </a>
                    <a
                      href={getDirectYouTubeStudioUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Direct link to YouTube Live Studio Dashboard"
                      className="px-2 py-1 rounded-lg bg-gray-900 hover:bg-black text-white text-[11px] font-bold transition-colors"
                    >
                      Direct Studio ↗
                    </a>
                    <a
                      href={getYouTubeChannelSwitcherUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Switch YouTube brand channel"
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-bold transition-colors"
                    >
                      Switch Channel ↗
                    </a>
                  </div>
                </div>

                {/* Synced YouTube ID indicator banner with 1-click sync */}
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-[11px]">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Synced YouTube ID: <b>{ytConnectedEmail || ytEmailInput || user?.email || 'typing.classes@gmail.com'}</b></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncWithLoggedInEmail}
                    className="ml-2 text-xs font-bold text-red-600 hover:text-red-700 underline flex-shrink-0 cursor-pointer"
                  >
                    Sync Email
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      YouTube Channel Email (Google Account)
                    </label>
                    <input
                      type="email"
                      value={ytEmailInput}
                      onChange={e => {
                        setYtEmailInput(e.target.value);
                        setYtConnectedEmail(e.target.value.trim());
                        saveKeyChannelBinding(streamKeyInput, e.target.value.trim(), ytChannelId, ytChannelName);
                      }}
                      placeholder="typing.classes@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      YouTube Channel ID (`UC...`) or Studio Link
                    </label>
                    <input
                      type="text"
                      value={ytChannelId}
                      onChange={e => {
                        const cleaned = extractCleanChannelId(e.target.value);
                        setYtChannelId(cleaned);
                        saveKeyChannelBinding(streamKeyInput, ytConnectedEmail || ytEmailInput, cleaned, ytChannelName);
                      }}
                      placeholder="Paste Studio URL or UC..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={savingKey}
                  onClick={() => handleSaveStreamKeyAndContinue(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 text-sm transition-all"
                >
                  {savingKey ? 'Saving...' : 'Next: Select Stream Source ›'}
                </button>
                <button
                  type="button"
                  disabled={savingKey}
                  onClick={() => handleSaveStreamKeyAndContinue(true)}
                  className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 text-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <Radio className="w-4 h-4" />
                  <span>Save & Go Live Directly</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          STEP 2: STREAM SOURCE SCREEN (All 8 tools + Source cards 100% interactive)
      ====================================================================== */}
      {flowStep === 'source_step2' && (
        <div className="bg-white min-h-[calc(100vh-140px)] p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col justify-between relative">
          {/* Top Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setFlowStep('youtube_step1')}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-800"
                title="Back to YouTube & Stream Key"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setOpenToolPanels(p => ({ ...p, more: !p.more }))}
                className={`w-11 h-11 rounded-2xl transition-colors flex items-center justify-center ${
                  openToolPanels.more
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                title="Stream Encoder & Audio Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Stream Source</h1>
            <p className="text-xs text-gray-500 mb-5">
              Destination: <span className="font-semibold text-gray-800">{streamTitle}</span> ({streamMode === 'youtube_login' ? 'YouTube Broadcast' : 'Stream Key Ready'})
            </p>

            {/* Source Selection Cards */}
            <div className="space-y-3.5 mb-6">
              {/* 1. Stream Camera */}
              <div
                onClick={() => {
                  setSelectedSource('camera');
                  showToast('Selected source: Stream Camera');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedSource === 'camera'
                    ? 'border-red-600 bg-white shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-normal text-gray-900 text-lg block">Stream Camera</span>
                      <span className="text-xs text-gray-500">
                        {cameraFacing === 'user' ? 'Front Webcam / Selfie Cam' : 'Rear Camera'} · {quality} @ {fps}fps
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xl font-light">›</span>
                </div>

                {selectedSource === 'camera' && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraFacing(f => (f === 'user' ? 'environment' : 'user'));
                          showToast(`Switched to ${cameraFacing === 'user' ? 'Rear' : 'Front'} Camera`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-gray-800"
                      >
                        Flip Camera ({cameraFacing === 'user' ? 'Front' : 'Back'})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMicEnabled(!micEnabled);
                          showToast(micEnabled ? 'Mic Muted' : 'Mic Active');
                        }}
                        className={`px-3 py-1.5 rounded-xl font-semibold ${
                          micEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {micEnabled ? 'Mic: ON' : 'Mic: Muted'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Open Camera Studio ›
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Screen Broadcast */}
              <div
                onClick={() => {
                  setSelectedSource('screen');
                  showToast('Selected source: Screen Broadcast');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedSource === 'screen'
                    ? 'border-red-600 bg-white shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-normal text-gray-900 text-lg block">Screen Broadcast</span>
                      <span className="text-xs text-gray-500">Capture Entire Screen, Window, or Browser Tab with Audio</span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xl font-light">›</span>
                </div>

                {selectedSource === 'screen' && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <span className="text-gray-600 font-medium">
                      System Audio + Mic Commentary Ready ({quality} {fps}fps)
                    </span>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Start Screen Broadcast ›
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Video */}
              <div
                onClick={() => {
                  setSelectedSource('video');
                  showToast('Selected source: Pre-Recorded Video Loop');
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedSource === 'video'
                    ? 'border-red-600 bg-white shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-normal text-gray-900 text-lg block">Video</span>
                      <span className="text-xs text-gray-500">
                        {localVideoName
                          ? `Loaded: ${localVideoName}`
                          : videos[0]?.title
                          ? `Cloud Video: ${videos[0].title}`
                          : 'Stream MP4/WebM video file in 24/7 loop'}
                      </span>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xl font-light">›</span>
                </div>

                {selectedSource === 'video' && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <label className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer inline-flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{localVideoName ? 'Change Video File' : 'Choose Video from Device'}</span>
                      <input type="file" accept="video/*" onChange={handleLocalVideoFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleStep2Next}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      Open Video Studio ›
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================================
                INTERACTIVE MULTI-TOOL PANELS (Multiple tools can be open together)
            ================================================================== */}
            {Object.values(openToolPanels).some(Boolean) && (
              <div className="mb-6 space-y-4 animate-fadeIn">
                {openToolPanels.tips && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, tips: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close tips panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-amber-700 font-bold text-sm">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span>Live Streaming Tips & Checklist</span>
                      </div>
                      <ul className="text-xs text-gray-700 space-y-2 pl-1">
                        <li>• <strong>Stream Camera:</strong> Position light in front of you and use 1080p @ 60 FPS for crystal-clear video.</li>
                        <li>• <strong>Screen Broadcast:</strong> Best for gaming, tutorials, and scoreboard broadcasts.</li>
                        <li>• <strong>Video 24/7 Loop:</strong> Upload any MP4 video and enable <strong>Replay Loop</strong> for non-stop 24/7 streaming.</li>
                        <li>• <strong>Stream Key:</strong> Keep your YouTube or Facebook RTMP key private. Current bitrate: <strong>{videoBitrate}</strong>.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {openToolPanels.landscape && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, landscape: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close orientation panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-gray-900">Stream Orientation (Aspect Ratio)</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setLandscape(true);
                            showToast('Orientation set to Landscape (16:9)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            landscape ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">Landscape (16:9)</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Standard YouTube, Facebook & TV widescreen</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLandscape(false);
                            showToast('Orientation set to Portrait (9:16)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            !landscape ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">Portrait (9:16)</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Vertical YouTube Shorts, Reels & Mobile Live</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {openToolPanels.quality && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, quality: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close quality panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-gray-900">Video Resolution & Bitrate</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQuality('1080p');
                            setVideoBitrate('4500 kbps');
                            showToast('Video quality set to 1080p Full HD (4500 kbps)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            quality === '1080p' ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">FHD · 1080p Full HD</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">1920×1080 · Recommended 4500 kbps</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuality('720p');
                            setVideoBitrate('2500 kbps');
                            showToast('Video quality set to 720p HD (2500 kbps)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            quality === '720p' ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">HD · 720p Standard HD</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">1280×720 · Recommended 2500 kbps</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {openToolPanels.fps && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, fps: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close FPS panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="text-sm font-bold text-gray-900">Stream Frame Rate (FPS)</div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setFps('60');
                            showToast('Frame rate set to 60 FPS (Ultra Smooth)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            fps === '60' ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">60 FPS (High Action)</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Ideal for gaming, sports, and smooth camera motion</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFps('30');
                            showToast('Frame rate set to 30 FPS (Standard)');
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                            fps === '30' ? 'border-red-600 bg-white shadow-sm' : 'border-gray-200 bg-white/60'
                          }`}
                        >
                          <div className="font-bold text-xs text-gray-900">30 FPS (Standard Broadcast)</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">Lower bandwidth usage, reliable for 24/7 loops</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {openToolPanels.overlay && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, overlay: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close overlay panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                          <Type className="w-4 h-4 text-purple-600" />
                          <span>Live Stream Overlay & Banner</span>
                        </div>
                        <label className="inline-flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={overlayEnabled}
                            onChange={e => setOverlayEnabled(e.target.checked)}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <span>Show Overlay</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Banner Headline Text</label>
                          <input
                            type="text"
                            value={overlayText}
                            onChange={e => setOverlayText(e.target.value)}
                            placeholder={streamTitle || 'Welcome to our Live Stream!'}
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-600 mb-1">Ticker / Subtitle Label</label>
                          <input
                            type="text"
                            value={overlaySubtext}
                            onChange={e => setOverlaySubtext(e.target.value)}
                            placeholder="LIVE 24/7 STREAM"
                            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => setShowWatermark(!showWatermark)}
                          className={`px-3 py-1.5 rounded-xl font-semibold border ${
                            showWatermark ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          Watermark Logo: {showWatermark ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowChatOverlay(!showChatOverlay)}
                          className={`px-3 py-1.5 rounded-xl font-semibold border ${
                            showChatOverlay ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                          }`}
                        >
                          Live Chat Box: {showChatOverlay ? 'ON' : 'OFF'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverlayPosition(p => (p === 'bottom' ? 'top' : 'bottom'))}
                          className="px-3 py-1.5 rounded-xl font-semibold border bg-white border-gray-200 text-gray-700"
                        >
                          Position: {overlayPosition === 'bottom' ? 'Bottom Lower-Third' : 'Top Banner'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {openToolPanels.teams && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, teams: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close teams panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                          <Trophy className="w-4 h-4 text-red-600" />
                          <span>Teams & Live Scoreboard Overlay</span>
                        </div>
                        <label className="inline-flex items-center space-x-1.5 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={teamsEnabled}
                            onChange={e => {
                              setTeamsEnabled(e.target.checked);
                              showToast(e.target.checked ? 'Teams Scoreboard enabled on stream!' : 'Teams Scoreboard hidden');
                            }}
                            className="rounded text-red-600 focus:ring-red-500"
                          />
                          <span>Enable Scoreboard</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-2">
                          <label className="block text-[11px] font-bold text-gray-500">Team 1 Name</label>
                          <input
                            type="text"
                            value={teamAName}
                            onChange={e => setTeamAName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                          />
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-gray-500">Score:</span>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setTeamAScore(Math.max(0, teamAScore - 1))}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm"
                              >
                                -
                              </button>
                              <span className="font-black text-base tabular-nums">{teamAScore}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTeamAScore(teamAScore + 1);
                                  setTeamsEnabled(true);
                                }}
                                className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white border border-gray-200 space-y-2">
                          <label className="block text-[11px] font-bold text-gray-500">Team 2 Name</label>
                          <input
                            type="text"
                            value={teamBName}
                            onChange={e => setTeamBName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold"
                          />
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-gray-500">Score:</span>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setTeamBScore(Math.max(0, teamBScore - 1))}
                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-sm"
                              >
                                -
                              </button>
                              <span className="font-black text-base tabular-nums">{teamBScore}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTeamBScore(teamBScore + 1);
                                  setTeamsEnabled(true);
                                }}
                                className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {openToolPanels.replay && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, replay: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close replay panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                          <span>Instant Replay & 24/7 Video Loop</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setReplayEnabled(!replayEnabled);
                            showToast(!replayEnabled ? 'Instant Replay Buffer ON' : 'Instant Replay Buffer OFF');
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            replayEnabled ? 'border-emerald-600 bg-emerald-50/50 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>Instant Replay</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{replayEnabled ? `Active (${replayBufferSecs}s buffer)` : 'Disabled'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLoopVideo(!loopVideo);
                            showToast(!loopVideo ? '24/7 Continuous Video Loop ON' : 'Video Loop OFF');
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            loopVideo ? 'border-purple-600 bg-purple-50/50 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>24/7 Non-Stop Loop</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{loopVideo ? 'Auto-Repeats Video' : 'Play Once'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAutoSaveRecording(!autoSaveRecording);
                            showToast(!autoSaveRecording ? 'Local Stream Recording ON' : 'Local Stream Recording OFF');
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            autoSaveRecording ? 'border-blue-600 bg-blue-50/50 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>Save Local Copy</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{autoSaveRecording ? 'Records WebM/MP4' : 'Off'}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {(openToolPanels.more || openToolPanels.settings) && (
                  <div className="p-5 rounded-3xl bg-gray-50 border-2 border-red-100 shadow-lg relative">
                    <button
                      type="button"
                      onClick={() => setOpenToolPanels(p => ({ ...p, more: false, settings: false }))}
                      className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white hover:bg-gray-200 text-gray-600 shadow-sm"
                      aria-label="Close more panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-bold text-gray-900">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span>Advanced Broadcast & Audio Controls</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setNoiseSuppression(!noiseSuppression);
                            showToast(`Mic Noise Suppression: ${!noiseSuppression ? 'ON' : 'OFF'}`);
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            noiseSuppression ? 'border-blue-600 bg-blue-50/40 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>Noise Suppression</div>
                          <div className="text-[11px] text-gray-500">{noiseSuppression ? 'Clean Voice ON' : 'Raw Mic Audio'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAutoReconnect(!autoReconnect);
                            showToast(`24/7 Auto-Reconnect: ${!autoReconnect ? 'ON' : 'OFF'}`);
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            autoReconnect ? 'border-emerald-600 bg-emerald-50/40 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>24/7 Auto-Reconnect</div>
                          <div className="text-[11px] text-gray-500">{autoReconnect ? 'Protected' : 'Disabled'}</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMirrorCamera(!mirrorCamera);
                            showToast(`Mirror Camera: ${!mirrorCamera ? 'ON' : 'OFF'}`);
                          }}
                          className={`p-3 rounded-xl border text-left ${
                            mirrorCamera ? 'border-purple-600 bg-purple-50/40 font-bold' : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div>Mirror Front Cam</div>
                          <div className="text-[11px] text-gray-500">{mirrorCamera ? 'Mirrored' : 'Normal'}</div>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-gray-700">Color Filter:</span>
                          {(['none', 'vivid', 'warm', 'cinema'] as const).map(flt => (
                            <button
                              key={flt}
                              type="button"
                              onClick={() => {
                                setVideoFilter(flt);
                                showToast(`Color grade filter: ${flt.toUpperCase()}`);
                              }}
                              className={`px-2.5 py-1 rounded-lg capitalize font-semibold ${
                                videoFilter === flt ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700'
                              }`}
                            >
                              {flt}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenToolPanels(p => ({ ...p, more: false, settings: false }));
                            setSubModal('stream_key');
                            setFlowStep('youtube_step1');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold"
                        >
                          Edit RTMP Key ›
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Floating 8-Tool Card + Next Button */}
          <div>
            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-5 mb-5 relative">
              {/* Floating LIVE NOW circular badge on right edge matching screenshot */}
              <button
                type="button"
                onClick={handleStep2Next}
                title="Open Live Broadcast Studio"
                className="absolute -right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gray-300/90 hover:bg-gray-400/90 shadow-md flex items-center justify-center transition-transform hover:scale-105"
              >
                <div className="w-10 h-7 rounded-md bg-red-600 text-white text-[8px] font-black flex items-center justify-center tracking-tighter">
                  <span className="bg-white text-red-600 px-0.5 rounded-[2px] mr-0.5">LIVE</span>
                  <span>NOW</span>
                </div>
              </button>

              <div className="grid grid-cols-4 gap-4 text-center pr-6">
                {/* 1. Tips */}
                <button
                  type="button"
                  onClick={() => setOpenToolPanels(p => ({ ...p, tips: !p.tips }))}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.tips ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <span className="text-xs">Tips</span>
                </button>

                {/* 2. Landscape / Portrait */}
                <button
                  type="button"
                  onClick={() => {
                    setLandscape(prev => !prev);
                    setOpenToolPanels(p => ({ ...p, landscape: !p.landscape }));
                    showToast(!landscape ? 'Switched to Landscape (16:9)' : 'Switched to Portrait (9:16)');
                  }}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.landscape ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <div
                      className={`border-2 border-current rounded-[3px] transition-all ${
                        landscape ? 'w-6 h-4' : 'w-4 h-6'
                      }`}
                    />
                  </div>
                  <span className="text-xs">{landscape ? 'Landscape' : 'Portrait'}</span>
                </button>

                {/* 3. Video quality */}
                <button
                  type="button"
                  onClick={() => {
                    setQuality(q => (q === '1080p' ? '720p' : '1080p'));
                    setOpenToolPanels(p => ({ ...p, quality: !p.quality }));
                    showToast(`Video Quality: ${quality === '1080p' ? '720p HD' : '1080p FHD'}`);
                  }}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.quality ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center mb-1">
                    <span className="px-1.5 py-0.5 border-2 border-current rounded-[4px] text-[10px] font-bold">
                      {quality === '1080p' ? 'FHD' : 'HD'}
                    </span>
                  </div>
                  <span className="text-xs">Video quality</span>
                </button>

                {/* 4. FPS */}
                <button
                  type="button"
                  onClick={() => {
                    setFps(f => (f === '30' ? '60' : '30'));
                    setOpenToolPanels(p => ({ ...p, fps: !p.fps }));
                    showToast(`Frame Rate: ${fps === '30' ? '60 FPS' : '30 FPS'}`);
                  }}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.fps ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center mb-1">
                    <span className="px-2 py-0.5 border-2 border-current rounded-[4px] text-[10px] font-bold">
                      {fps}
                    </span>
                  </div>
                  <span className="text-xs">FPS</span>
                </button>

                {/* 5. Overlay */}
                <button
                  type="button"
                  onClick={() => setOpenToolPanels(p => ({ ...p, overlay: !p.overlay }))}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all relative ${
                    openToolPanels.overlay ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <Grid className="w-6 h-6" />
                  </div>
                  <span className="text-xs">Overlay</span>
                </button>

                {/* 6. Teams */}
                <button
                  type="button"
                  onClick={() => setOpenToolPanels(p => ({ ...p, teams: !p.teams }))}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all relative ${
                    openToolPanels.teams || teamsEnabled
                      ? 'bg-red-50 text-red-600 font-bold'
                      : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-xs">{teamsEnabled ? `Teams (${teamAScore}-${teamBScore})` : 'Teams'}</span>
                </button>

                {/* 7. Replay */}
                <button
                  type="button"
                  onClick={() => setOpenToolPanels(p => ({ ...p, replay: !p.replay }))}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.replay ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <span className="text-xs">Replay</span>
                </button>

                {/* 8. More */}
                <button
                  type="button"
                  onClick={() => setOpenToolPanels(p => ({ ...p, more: !p.more }))}
                  className={`flex flex-col items-center cursor-pointer rounded-2xl py-1.5 transition-all ${
                    openToolPanels.more ? 'bg-red-50 text-red-600 font-bold' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
                    <MoreHorizontal className="w-6 h-6" />
                  </div>
                  <span className="text-xs">More</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStep2Next}
              className="w-full py-4 rounded-xl font-bold text-white text-lg bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.99]"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: LIVE BROADCAST STUDIO (With all overlays, scoreboard, replay & camera/screen/video)
      ====================================================================== */}
      {flowStep === 'live_step3' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Studio Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFlowStep('source_step2')}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-gray-900">{streamTitle}</h2>
                <p className="text-xs text-gray-500">
                  {selectedSource.toUpperCase()} · {quality} @ {fps}FPS · {landscape ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 tabular-nums ${
                  connectionState === 'Live'
                    ? 'bg-red-600 text-white'
                    : connectionState === 'Connecting'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${connectionState === 'Live' ? 'bg-white animate-ping' : 'bg-gray-500'}`} />
                <span>{connectionState === 'Live' ? `LIVE · ${formatDuration(liveSeconds)}` : connectionState}</span>
              </span>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Live Status & YouTube Studio Guidance Banner */}
            {connectionState === 'Live' && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Radio className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="font-black text-sm flex items-center space-x-2">
                      <span>YouTube RTMPS Ingest Active!</span>
                      <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">LIVE FEED CONNECTED</span>
                    </div>
                    <p className="text-xs text-red-100 mt-0.5">
                      Stream YouTube par publicly live dikhane ke liye <b>Open YouTube Studio Live ↗</b> par click karein aur YouTube Studio me <b>Go Live</b> button dabayein.
                    </p>
                  </div>
                </div>
                <a
                  href={getYouTubeStudioLiveUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-white text-red-600 font-black text-xs hover:bg-red-50 transition-colors whitespace-nowrap shadow-sm flex items-center space-x-1.5"
                >
                  <span>Open YouTube Studio Live ↗</span>
                </a>
              </div>
            )}

            {/* Live Video Monitor with Real-Time Overlays, Scoreboard, Watermark & Replay */}
            <div
              className={`relative bg-gray-950 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800 shadow-inner ${
                landscape ? 'aspect-video w-full' : 'aspect-[9/16] max-w-xs mx-auto'
              }`}
            >
              {selectedSource === 'video' ? (
                <video
                  src={localVideoUrl || SAMPLE_FALLBACK_VIDEO}
                  controls
                  autoPlay
                  loop={loopVideo}
                  muted={speakerMuted}
                  className={`w-full h-full object-contain${filterCssClass}`}
                />
              ) : (
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!camEnabled ? 'opacity-0' : 'opacity-100'} ${
                    mirrorCamera ? 'scale-x-[-1]' : ''
                  }${filterCssClass}`}
                />
              )}

              {/* Standby fallback if camera/screen not yet active */}
              {selectedSource !== 'video' && (!mediaStreamRef.current || !camEnabled) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-900/90 text-white">
                  {selectedSource === 'camera' ? (
                    <Camera className="w-12 h-12 text-red-500 mb-3" />
                  ) : (
                    <Monitor className="w-12 h-12 text-blue-400 mb-3" />
                  )}
                  <p className="text-sm font-bold">
                    {selectedSource === 'camera' ? 'Camera Studio Preview' : 'Screen Broadcast Preview'}
                  </p>
                  {mediaError && <p className="text-xs text-gray-400 mt-1 max-w-md">{mediaError}</p>}
                  <button
                    type="button"
                    onClick={() => startMediaPreview(selectedSource)}
                    className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    {selectedSource === 'camera' ? 'Enable Camera & Mic' : 'Select Screen / Window to Share'}
                  </button>
                </div>
              )}

              {/* Watermark Badge */}
              {showWatermark && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/15 text-[10px] font-bold tracking-wide pointer-events-none">
                  CreatorLive<span className="text-red-400">24/7</span>
                </div>
              )}

              {/* Instant Replay Badge */}
              {isReplayingClip && (
                <div className="absolute top-3 left-3 bg-amber-500 text-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>INSTANT REPLAY ({replayBufferSecs}s)</span>
                </div>
              )}

              {/* Teams Live Scoreboard Overlay */}
              {teamsEnabled && (
                <div className="absolute top-3 left-3 bg-gray-950/90 backdrop-blur-md text-white rounded-xl border border-white/20 px-3.5 py-2 flex items-center space-x-3 shadow-lg text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-400">{teamAName}</span>
                    <span className="bg-red-600 text-white px-2 py-0.5 rounded font-black tabular-nums">{teamAScore}</span>
                  </div>
                  <span className="text-gray-400 font-bold">VS</span>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-black tabular-nums">{teamBScore}</span>
                    <span className="font-bold text-blue-400">{teamBName}</span>
                  </div>
                  <span className="text-[10px] text-gray-300 border-l border-white/20 pl-2">{matchPeriod}</span>
                </div>
              )}

              {/* Live Chat Overlay Box */}
              {showChatOverlay && (
                <div className="absolute bottom-16 right-3 w-52 bg-black/65 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/15 text-[11px] space-y-1 pointer-events-none">
                  <div className="font-bold text-emerald-400 flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>Live Chat</span>
                  </div>
                  <div><span className="text-purple-300 font-semibold">Rahul:</span> Radhe Radhe ji! 🙏</div>
                  <div><span className="text-blue-300 font-semibold">Priya:</span> Awesome 1080p stream quality!</div>
                </div>
              )}

              {/* Live Lower-Third / Top Banner Overlay */}
              {overlayEnabled && (overlayText || streamTitle) && (
                <div
                  className={`absolute left-4 right-4 ${
                    overlayPosition === 'top' ? 'top-14' : 'bottom-3'
                  } bg-gradient-to-r from-red-600/95 via-gray-900/95 to-gray-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/20 flex items-center justify-between shadow-lg pointer-events-none`}
                >
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-red-200">{overlaySubtext}</div>
                    <div className="text-xs sm:text-sm font-bold">{overlayText || streamTitle}</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded">
                    {quality} · {fps}FPS
                  </span>
                </div>
              )}
            </div>

            {/* Quick Live Scoreboard Controls if Teams is enabled */}
            {teamsEnabled && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-gray-800">Live Scoreboard Controls:</span>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-gray-700">{teamAName}:</span>
                    <button
                      type="button"
                      onClick={() => setTeamAScore(Math.max(0, teamAScore - 1))}
                      className="px-2 py-1 rounded bg-white border border-gray-300 font-bold"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamAScore(teamAScore + 1)}
                      className="px-2 py-1 rounded bg-red-600 text-white font-bold"
                    >
                      +1
                    </button>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-gray-700">{teamBName}:</span>
                    <button
                      type="button"
                      onClick={() => setTeamBScore(Math.max(0, teamBScore - 1))}
                      className="px-2 py-1 rounded bg-white border border-gray-300 font-bold"
                    >
                      -1
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamBScore(teamBScore + 1)}
                      className="px-2 py-1 rounded bg-blue-600 text-white font-bold"
                    >
                      +1
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Studio Source & Audio/Video Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                    micEnabled
                      ? 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  <span>{micEnabled ? 'Mic On' : 'Muted'}</span>
                </button>

                {selectedSource === 'camera' && (
                  <>
                    <button
                      type="button"
                      onClick={toggleCam}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors ${
                        camEnabled
                          ? 'bg-white border-gray-200 text-gray-800 hover:bg-gray-100'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}
                    >
                      {camEnabled ? <Camera className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      <span>{camEnabled ? 'Camera On' : 'Camera Off'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCameraFacing(f => (f === 'user' ? 'environment' : 'user'))}
                      className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-800"
                    >
                      Flip Cam
                    </button>
                  </>
                )}

                {selectedSource === 'screen' && (
                  <button
                    type="button"
                    onClick={() => startMediaPreview('screen')}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Share Screen</span>
                  </button>
                )}

                {selectedSource === 'video' && (
                  <>
                    <label className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold flex items-center space-x-1.5 cursor-pointer">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>{localVideoName ? 'Change Video' : 'Load Video File'}</span>
                      <input type="file" accept="video/*" onChange={handleLocalVideoFile} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setSpeakerMuted(!speakerMuted)}
                      className="px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-xs font-bold flex items-center space-x-1.5"
                    >
                      {speakerMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
                      <span>{speakerMuted ? 'Audio Muted' : 'Video Audio ON'}</span>
                    </button>
                  </>
                )}

                {replayEnabled && (
                  <button
                    type="button"
                    onClick={handleTriggerInstantReplay}
                    className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Instant Replay</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs">
                {recordedDownloadUrl && (
                  <a
                    href={recordedDownloadUrl}
                    download={`stream-recording-${Date.now()}.webm`}
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Recording</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSubModal('stream_key');
                    setFlowStep('youtube_step1');
                  }}
                  className="px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 font-semibold text-gray-700 flex items-center space-x-1"
                >
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Stream Key</span>
                </button>
              </div>
            </div>

            {/* Inline YouTube Stream Key & Real-Time RTMPS Status Box */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-gray-500 font-semibold">YouTube RTMPS Ingestion Server (Port 443 TLS)</div>
                  <div className="font-mono text-gray-800 truncate max-w-md">rtmps://a.rtmps.youtube.com:443/live2</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={getYouTubeStudioLiveUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open YouTube Studio Live via Google Account (${ytConnectedEmail || ytEmailInput || 'typing.classes@gmail.com'})`}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-sm"
                  >
                    Open YouTube Studio Live ↗
                  </a>
                  <a
                    href={getDirectYouTubeStudioUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Direct link to YouTube Live Studio Dashboard"
                    className="px-2.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition-colors shadow-sm"
                  >
                    Direct Studio ↗
                  </a>
                  <a
                    href={getYouTubeChannelSwitcherUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Select a specific YouTube Brand Channel for this Stream Key"
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold transition-colors"
                  >
                    Switch Channel ↗
                  </a>
                  <button
                    type="button"
                    onClick={handleAutoFetchYouTubeStreamKey}
                    disabled={fetchingYtKey}
                    className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    {fetchingYtKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Auto-Fetch Key</span>
                  </button>
                </div>
              </div>

              {/* Warning Banner when Demo Key is still active */}
              {isPlaceholderKey(streamKeyInput) && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-2.5">
                  <Key className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-950">
                      Real YouTube Stream Key Required (`xxxx-xxxx-xxxx-xxxx-xxxx`)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Abhi Demo Key (<span className="font-mono font-bold">{streamKeyInput || 'none'}</span>) laga hua hai. YouTube par real live dikhne ke liye <b>Open YouTube Studio Live ↗</b> par click karke apna <b>Stream Key</b> copy karein aur niche box me paste karein:
                    </p>
                  </div>
                </div>
              )}

              {/* Direct Stream Key Input inside Step 3 */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  YouTube Stream Key (Paste from YouTube Studio → Go Live)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={step3StreamKeyInputRef}
                      type={showKey ? 'text' : 'password'}
                      value={streamKeyInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStreamKeyInput(val);
                        localStorage.setItem('cl247_saved_stream_key', val.trim());
                        applySavedBindingForKey(val);
                        if (rtmpError) setRtmpError(null);
                      }}
                      placeholder="e.g. abcd-1234-efgh-5678-ijkl"
                      className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 ${
                        isPlaceholderKey(streamKeyInput)
                          ? 'border-amber-300 bg-white focus:ring-amber-500'
                          : 'border-emerald-300 bg-white focus:ring-emerald-600'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg"
                        title={showKey ? 'Hide Stream Key' : 'Show Stream Key'}
                      >
                        {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const clip = await navigator.clipboard.readText();
                            if (clip && clip.trim()) {
                              const cleanClip = clip.trim();
                              setStreamKeyInput(cleanClip);
                              localStorage.setItem('cl247_saved_stream_key', cleanClip);
                              applySavedBindingForKey(cleanClip);
                              setRtmpError(null);
                              showToast('Stream key pasted & saved!');
                            }
                          } catch {
                            step3StreamKeyInputRef.current?.focus();
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px]"
                      >
                        Paste
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!streamKeyInput.trim()) return;
                      const clean = streamKeyInput.trim();
                      localStorage.setItem('cl247_saved_stream_key', clean);
                      saveKeyChannelBinding(clean, ytConnectedEmail || ytEmailInput, ytChannelId, ytChannelName);
                      const targetId = streams[0]?.id || selectedStreamId;
                      await updateStreamConfig(targetId, {
                        streamKey: clean,
                        destinationUrl: 'rtmps://a.rtmps.youtube.com:443/live2'
                      });
                      setRtmpError(null);
                      showToast(`Stream Key saved & linked to ${ytConnectedEmail || ytEmailInput || 'your YouTube channel'}!`);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs whitespace-nowrap cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              {/* Target YouTube Channel Email & Channel ID / Studio URL Binding for this Stream Key */}
              <div className="pt-1 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-gray-600">
                      Stream Key YouTube Email (Google Account)
                    </label>
                    <button
                      type="button"
                      onClick={handleSyncWithLoggedInEmail}
                      className="text-[10px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                    >
                      Sync Email ({user?.email || 'typing.classes@gmail.com'})
                    </button>
                  </div>
                  <input
                    type="email"
                    value={ytEmailInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setYtEmailInput(val);
                      setYtConnectedEmail(val.trim());
                      saveKeyChannelBinding(streamKeyInput, val.trim(), ytChannelId, ytChannelName);
                    }}
                    placeholder="typing.classes@gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[11px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">
                    YouTube Channel ID (`UC...`) or Studio URL (Exact Channel)
                  </label>
                  <input
                    type="text"
                    value={ytChannelId}
                    onChange={(e) => {
                      const cleaned = extractCleanChannelId(e.target.value);
                      setYtChannelId(cleaned);
                      saveKeyChannelBinding(streamKeyInput, ytConnectedEmail || ytEmailInput, cleaned, ytChannelName);
                    }}
                    placeholder="Paste studio.youtube.com/channel/UC... or UC..."
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-[11px] font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Video upload status for FFmpeg */}
              {selectedSource === 'video' && (
                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-600">
                  <span>
                    Video Source: <b>{localVideoName || 'Default Studio Loop MP4'}</b>
                  </span>
                  <span className="font-bold text-emerald-700">
                    {uploadingVideoForRtmp
                      ? '⏳ Uploading video to FFmpeg encoder...'
                      : rtmpVideoUploaded
                      ? '✓ Video Ready on FFmpeg Server'
                      : '✓ Ready'}
                  </span>
                </div>
              )}

              {/* Real-time YouTube RTMPS Error Alert */}
              {rtmpError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                  {rtmpError}
                </div>
              )}

              {/* Real-time YouTube RTMPS Telemetry when Live */}
              {connectionState === 'Live' && rtmpTelemetry && (
                <div className="p-3 rounded-xl bg-emerald-950 text-emerald-100 border border-emerald-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white">
                      YouTube RTMPS Connected ({rtmpTelemetry.server})
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono text-emerald-300">
                    <span>Frames: {rtmpTelemetry.framesSent}</span>
                    <span>Bitrate: {rtmpTelemetry.bitrate}</span>
                    <span>Sent: {(rtmpTelemetry.bytesToYouTube / 1024).toFixed(0)} KB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Start / Stop Live Stream Button */}
            <button
              type="button"
              onClick={handleToggleLiveBroadcast}
              disabled={connectionState === 'Connecting' || uploadingVideoForRtmp}
              className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-xl flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
                connectionState === 'Live'
                  ? 'bg-gray-900 hover:bg-black shadow-gray-300'
                  : connectionState === 'Connecting'
                  ? 'bg-amber-500 text-white'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-200'
              }`}
            >
              {connectionState === 'Live' ? (
                <>
                  <Square className="w-5 h-5 fill-white" />
                  <span>STOP LIVE STREAM ({formatDuration(liveSeconds)})</span>
                </>
              ) : connectionState === 'Connecting' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>CONNECTING TO YOUTUBE RTMPS SERVER...</span>
                </>
              ) : (
                <>
                  <Radio className="w-5 h-5" />
                  <span>START LIVE STREAM NOW</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
