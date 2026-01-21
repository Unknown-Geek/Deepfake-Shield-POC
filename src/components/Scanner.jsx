import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Shield, ShieldCheck, ShieldAlert, Lock, RotateCcw, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react'
import { cn } from '../lib/utils'
import { addScanLog, updateUserCoins } from '../db'
import { useUser } from '../context/UserContext'
import { useStats } from '../context/StatsContext'
import { useToast } from './Toast'

// Scan phases with their display text
const SCAN_PHASES = [
    { id: 'encrypting', text: 'Encrypting...', duration: 1000 },
    { id: 'isolating', text: 'Isolating...', duration: 1000 },
    { id: 'analyzing', text: 'Analyzing...', duration: 1000 },
]

// Reasons for scan results
const FAKE_REASONS = [
    'Face swap artifacts detected',
    'Audio-visual sync mismatch',
    'Unnatural eye blinking patterns',
    'Temporal inconsistencies found',
    'Compression artifacts suggest manipulation',
]

const REAL_REASONS = [
    'No manipulation detected',
    'Original media verified',
    'Consistent temporal patterns',
    'Natural facial movements confirmed',
    'Audio-visual sync verified',
]

/**
 * Scanner component for deepfake detection
 * Features drop zone, animated progress, SQLite integration
 */
export default function Scanner() {
    const { user } = useUser()
    const { refreshStats } = useStats()
    const toast = useToast()
    const fileInputRef = useRef(null)

    const [state, setState] = useState('idle') // idle, scanning, result
    const [currentPhase, setCurrentPhase] = useState(0)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [fileName, setFileName] = useState('')

    const handleFileSelect = (file) => {
        if (!file) return

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload an image or video file')
            return
        }

        setFileName(file.name)
        startScan()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        handleFileSelect(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleInputChange = (e) => {
        const file = e.target.files[0]
        handleFileSelect(file)
    }

    const startScan = async () => {
        setState('scanning')
        setCurrentPhase(0)
        setProgress(0)

        // Animate through phases
        for (let i = 0; i < SCAN_PHASES.length; i++) {
            setCurrentPhase(i)

            // Animate progress for this phase
            const startProgress = (i / SCAN_PHASES.length) * 100
            const endProgress = ((i + 1) / SCAN_PHASES.length) * 100

            await animateProgress(startProgress, endProgress, SCAN_PHASES[i].duration)
        }

        // Generate result
        generateResult()
    }

    const animateProgress = (start, end, duration) => {
        return new Promise((resolve) => {
            const startTime = Date.now()
            const animate = () => {
                const elapsed = Date.now() - startTime
                const progress = Math.min(elapsed / duration, 1)
                setProgress(start + (end - start) * progress)

                if (progress < 1) {
                    requestAnimationFrame(animate)
                } else {
                    resolve()
                }
            }
            animate()
        })
    }

    const generateResult = () => {
        // Random result: 70% real, 30% fake for demo
        const isFake = Math.random() < 0.3
        const confidence = 75 + Math.random() * 24 // 75-99%

        const reasons = isFake ? FAKE_REASONS : REAL_REASONS
        const reason = reasons[Math.floor(Math.random() * reasons.length)]

        const scanResult = {
            isFake,
            confidence: Math.round(confidence * 10) / 10,
            reason,
        }

        setResult(scanResult)
        setState('result')

        // Save to SQLite
        if (user?.id) {
            addScanLog({
                userId: user.id,
                result: isFake ? 'fake' : 'safe',
                confidence: scanResult.confidence,
                reason: scanResult.reason,
            })

            // Award coins for scanning
            const coinsEarned = isFake ? 15 : 10
            updateUserCoins(user.id, coinsEarned)

            // Refresh stats in header (real-time update)
            refreshStats()

            toast.success(`+${coinsEarned} coins earned!`)
        }
    }

    const reset = () => {
        setState('idle')
        setResult(null)
        setFileName('')
        setProgress(0)
        setCurrentPhase(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="p-4">
            <AnimatePresence mode="wait">
                {state === 'idle' && (
                    <DropZone
                        key="dropzone"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={handleClick}
                    />
                )}

                {state === 'scanning' && (
                    <ScanningView
                        key="scanning"
                        phase={SCAN_PHASES[currentPhase]}
                        progress={progress}
                        fileName={fileName}
                    />
                )}

                {state === 'result' && result && (
                    <ResultView
                        key="result"
                        result={result}
                        fileName={fileName}
                        onReset={reset}
                    />
                )}
            </AnimatePresence>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleInputChange}
                className="hidden"
            />
        </div>
    )
}

/**
 * Drop zone component
 */
function DropZone({ onDrop, onDragOver, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={onClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn(
                "min-h-[300px] rounded-3xl border-2 border-dashed border-white/20",
                "flex flex-col items-center justify-center gap-4 p-8",
                "cursor-pointer transition-all duration-300",
                "hover:border-success/50 hover:bg-success/5",
                "group"
            )}
        >
            <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-success/10 transition-colors"
            >
                <Upload className="w-8 h-8 text-muted group-hover:text-success transition-colors" />
            </motion.div>

            <div className="text-center">
                <p className="text-lg font-medium mb-1">Tap to secure your media</p>
                <p className="text-sm text-muted">Drop an image or video to analyze</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
                <Shield className="w-4 h-4" />
                <span>Supports JPG, PNG, GIF, MP4, WebM</span>
            </div>
        </motion.div>
    )
}

/**
 * Scanning progress view
 */
function ScanningView({ phase, progress, fileName }) {
    const circumference = 2 * Math.PI * 90
    const offset = circumference - (progress / 100) * circumference

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center py-8"
        >
            {/* Progress Ring */}
            <div className="relative w-48 h-48 mb-6">
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="90"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="90"
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Sparkles className="w-8 h-8 text-success mb-2" />
                    </motion.div>
                    <span className="text-sm font-medium text-success">{phase?.text}</span>
                    <span className="text-2xl font-semibold mt-1">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* File name */}
            <div className="glass rounded-2xl px-4 py-2 text-center">
                <p className="text-sm text-muted truncate max-w-[200px]">{fileName}</p>
            </div>
        </motion.div>
    )
}

/**
 * Result view with flip animation
 */
function ResultView({ result, fileName, onReset }) {
    const [isFlipped, setIsFlipped] = useState(false)

    // Trigger flip animation on mount
    useState(() => {
        setTimeout(() => setIsFlipped(true), 100)
    })

    const isFake = result.isFake
    const Icon = isFake ? ShieldAlert : ShieldCheck
    const color = isFake ? 'danger' : 'success'
    const bgColor = isFake ? 'bg-danger/10' : 'bg-success/10'
    const textColor = isFake ? 'text-danger' : 'text-success'
    const borderColor = isFake ? 'border-danger/30' : 'border-success/30'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4"
        >
            {/* Result Card with Flip Animation */}
            <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
                className={cn(
                    "w-full glass rounded-3xl p-6 border-2",
                    borderColor
                )}
            >
                {/* Result Icon */}
                <div className="flex justify-center mb-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
                        className={cn("w-20 h-20 rounded-3xl flex items-center justify-center", bgColor)}
                    >
                        <Icon className={cn("w-10 h-10", textColor)} />
                    </motion.div>
                </div>

                {/* Result Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mb-4"
                >
                    <h2 className={cn("text-2xl font-semibold mb-1", textColor)}>
                        {isFake ? 'Potential Deepfake' : 'Authentic Media'}
                    </h2>
                    <p className="text-muted text-sm">{result.reason}</p>
                </motion.div>

                {/* Confidence */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-4 mb-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted">Confidence</span>
                        <span className={cn("text-lg font-semibold", textColor)}>
                            {result.confidence}%
                        </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className={cn("h-full rounded-full", isFake ? 'bg-danger' : 'bg-success')}
                        />
                    </div>
                </motion.div>

                {/* File Info */}
                <div className="text-center text-xs text-muted mb-4">
                    Analyzed: {fileName}
                </div>

                {/* Trust Signal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center justify-center gap-2 text-xs text-muted border-t border-white/5 pt-4"
                >
                    <Lock className="w-4 h-4 text-success" />
                    <span>Zero-Knowledge: Log saved locally. File deleted.</span>
                </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex flex-col gap-3 w-full"
            >
                {/* Chat with AI Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    Chat with AI
                </motion.button>

                {/* Report Wrong Prediction Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Report Wrong Prediction
                </motion.button>

                {/* Scan Another Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <RotateCcw className="w-5 h-5" />
                    Scan Another
                </motion.button>
            </motion.div>
        </motion.div>
    )
}
