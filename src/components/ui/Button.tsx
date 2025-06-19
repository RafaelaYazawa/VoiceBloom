interface ButtonProps {
  text: string;
  className: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ className, onClick, text }) => {
  return (
    <div>
      <button className={className} onClick={onClick}>
        {text}
      </button>
    </div>
  );
};

export default Button;
