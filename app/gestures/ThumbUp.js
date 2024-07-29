import * as fp from 'fingerpose';

const ThumbUpGesture = new fp.GestureDescription('thumb_up');

ThumbUpGesture.addCurl(fp.Finger.Thumb, fp.FingerCurl.NoCurl);
thumbsUpGesture.addDirection(
	fp.Finger.Thumb,
	fp.FingerDirection.VerticalUp,
	1.0
);
ThumbUpGesture.addDirection(
	fp.Finger.Thumb,
	fp.FingerDirection.DiagonalUpLeft,
	0.9
);
ThumbUpGesture.addDirection(
	fp.Finger.Thumb,
	fp.FingerDirection.DiagonalUpRight,
	0.9
);

for (let finger of [
	fp.Finger.Index,
	fp.Finger.Middle,
	fp.Finger.Ring,
	fp.Finger.Pinky,
]) {
	ThumbUpGesture.addCurl(finger, fp.FingerCurl.FullCurl, 1.0);
	ThumbUpGesture.addCurl(finger, fp.FingerCurl.HalfCurl, 0.9);
}

export default ThumbUpGesture;
