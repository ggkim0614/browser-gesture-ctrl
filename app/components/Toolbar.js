import React from 'react';

const FloatingToolbar = ({ zoomLevel, onResetZoom, style }) => {
	return (
		<div
			style={{
				position: 'fixed',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				color: 'white',
				padding: '6px',
				borderRadius: '20px',
				display: 'flex',
				alignItems: 'center',
				gap: '20px',
				zIndex: 1000,
				...style,
			}}
		>
			<div className="font-mono font-normal text-[16px] pl-4">
				Current Zoom Level:{' '}
				<span className="font-bold">{zoomLevel.toFixed(0)}%</span>
			</div>
			<button
				onClick={onResetZoom}
				className="reset-zoom-button font-mono"
				style={{
					backgroundColor: '#4CAF50',
					border: 'none',
					color: 'white',
					padding: '8px 16px',
					textAlign: 'center',
					textDecoration: 'none',
					display: 'inline-block',
					fontSize: '16px',
					margin: '4px 2px',
					cursor: 'pointer',
					borderRadius: '12px',
				}}
			>
				Reset Zoom
			</button>
		</div>
	);
};

export default FloatingToolbar;
