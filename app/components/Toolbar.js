import React from 'react';

const FloatingToolbar = ({ zoomLevel, onResetZoom, style }) => {
	return (
		<div
			style={{
				...style,
			}}
			className="bg-black bg-opacity-65 text-white w-full items-center p-6 flex justify-between backdrop-blur-sm fixed bottom-0 z-100"
		>
			<div className="flex-col justify-between font-jbm">
				<div>Distant Browser Control</div>
				<div className="opacity-50">v1.0</div>
				<div className="font-jbm font-normal text-md text-[#167DFF]">
					Current Zoom Level:&nbsp;
					<span className="font-bold">{zoomLevel.toFixed(0)}%</span>
				</div>
			</div>
			<button
				onClick={onResetZoom}
				className="text-3xl text-center reset-zoom-button font-jbm rounded-full cursor-pointer bg-[#167DFF] transition-colors hover:bg-[#4268ff] border-none px-16 py-9"
			>
				Reset Zoom
			</button>
		</div>
	);
};

export default FloatingToolbar;
