const ContactScreen = ({ onNext }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div>
      <h2>Emergency Contact</h2>

      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Phone" onChange={e => setPhone(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />

      <button onClick={onNext}>Continue</button>
    </div>
  );
};