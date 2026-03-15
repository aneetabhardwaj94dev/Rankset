/**
 * Replace this component content with your Google AdSense code when approved.
 * Keep the same wrapper class "ad-placeholder" or replace with your ad container
 * so layout (non-intrusive placement) stays consistent.
 */
export default function AdPlaceholder({ position = 'top' }) {
  return (
    <div className={`ad-placeholder ad-${position}`} role="presentation">
      {/* AdSense: paste your ad unit here when approved */}
      <span>Advertisement</span>
    </div>
  );
}
