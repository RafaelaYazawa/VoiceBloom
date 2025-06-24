interface ButtonProps {
  children: string;
  className: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ className, onClick, children }) => {
  return (
    <div>
      <button className={className} onClick={onClick}>
        {children}
      </button>
    </div>
  );
};

export default Button;
