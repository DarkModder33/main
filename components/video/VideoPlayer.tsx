'use client';

import { Fullscreen, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title?: string;
    description?: string;
    chapters?: Array<{ time: number; title: string }>;
}

export function VideoPlayer({
    src,
    poster,
    title,
    description,
    chapters = [],
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (containerRef.current) {
            if (!isFullscreen) {
                containerRef.current.requestFullscreen().catch((err) => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
            setIsFullscreen(!isFullscreen);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = percent * duration;
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    const seekToChapter = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className="w-full bg-black rounded-lg overflow-hidden border border-white/10"
        >
            {/* Video Container */}
            <div className="relative w-full bg-black aspect-video">
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Play Button Overlay */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition group"
                    >
                        <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center group-hover:scale-110 transition">
                            <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                    </button>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent p-4 space-y-2 opacity-0 hover:opacity-100 transition-opacity">
                    {/* Progress Bar */}
                    <div
                        onClick={handleProgressClick}
                        className="w-full h-1 bg-white/20 rounded cursor-pointer hover:h-2 transition-all group"
                    >
                        <div
                            className="h-full bg-cyan-500 rounded transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        >
                            <div className="float-right w-3 h-3 bg-white rounded-full -mt-1 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                    </div>

                    {/* Controls Bar */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="p-2 hover:bg-white/20 rounded transition text-white"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current" />
                                )}
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group">
                                <button
                                    onClick={toggleMute}
                                    className="p-2 hover:bg-white/20 rounded transition text-white"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-5 h-5" />
                                    ) : (
                                        <Volume2 className="w-5 h-5" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover:w-20 transition-all h-1 bg-white/20 rounded cursor-pointer"
                                />
                            </div>

                            {/* Time Display */}
                            <span className="text-xs text-white/80 font-mono ml-2">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/20 rounded transition text-white"
                        >
                            <Fullscreen className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-6 bg-zinc-950/50 border-t border-white/10 space-y-4">
                {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
                {description && (
                    <p className="text-sm text-zinc-300 leading-relaxed">{description}</p>
                )}

                {/* Chapters */}
                {chapters.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Chapters
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {chapters.map((chapter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => seekToChapter(chapter.time)}
                                    className="text-left p-3 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 transition"
                                >
                                    <p className="text-xs text-cyan-400 font-semibold">
                                        {formatTime(chapter.time)}
                                    </p>
                                    <p className="text-sm text-white mt-1">{chapter.title}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
