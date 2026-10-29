const CortexLogo = ({ size = 38, className = "" }) => (
  <img
    src="/cortex-logo-lavender.png"
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    className={`block shrink-0 object-contain ${className}`}
  />
);

export default CortexLogo;
