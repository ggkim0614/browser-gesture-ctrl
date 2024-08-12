import React from 'react';

const FloatingToolbar = ({
	zoomLevel,
	onResetZoom,
	isVideoOpen,
	videoControls,
	onCloseVideo,
	style,
}) => {
	const isZoomed = zoomLevel !== 100;
	return (
		<div
			style={{
				...style,
			}}
			className="bg-black bg-opacity-65 text-white w-full items-center p-6 flex justify-between backdrop-blur-sm fixed bottom-0 z-[999]"
		>
			<div className="flex-col justify-between font-jbm">
				<div>Distant Browser Control</div>
				<div className="opacity-50">v1.0</div>
				{!isVideoOpen && (
					<div className="font-jbm font-normal text-md text-[#167DFF]">
						Current Zoom Level:&nbsp;
						<span className="font-bold">{zoomLevel.toFixed(0)}%</span>
					</div>
				)}
			</div>
			{isVideoOpen && videoControls ? (
				<div className="flex items-center space-x-4">
					<button
						onClick={() => videoControls.seekVideo(-10)}
						className="text-3xl text-center font-jbm rounded-full cursor-pointer bg-white text-neutral-800 transition-colors hover:bg-[#dfdfdf] border-none px-9 py-9"
					>
						–10
					</button>
					<button
						onClick={videoControls.togglePlayPause}
						className="text-3xl text-center font-jbm rounded-full cursor-pointer bg-[#167DFF] transition-colors hover:bg-[#4268ff] border-none px-14 py-9"
					>
						{videoControls.isPlaying ? 'Pause' : 'Play'}
					</button>
					<button
						onClick={() => videoControls.seekVideo(10)}
						className="text-3xl text-center font-jbm rounded-full cursor-pointer bg-white transition-colors hover:bg-[#dfdfdf] border-none px-9 py-9 text-neutral-800"
					>
						+10
					</button>
					<button
						onClick={onCloseVideo}
						className="text-3xl text-center font-jbm rounded-full cursor-pointer bg-[#fb7131] transition-colors hover:bg-[#ff8f5a] border-none px-14 py-9"
					>
						Close
					</button>
				</div>
			) : null}
			<button
				onClick={onResetZoom}
				disabled={!isZoomed}
				className={`text-2xl text-black text-center reset-zoom-button font-jbm rounded-full cursor-pointer bg-white transition-colors hover:bg-[#d5ddff] border-none px-14 py-8 ${
					isZoomed ? '' : 'opacity-25 cursor-not-allowed'
				}`}
			>
				Reset Zoom
			</button>
		</div>
	);
};

export default FloatingToolbar;
