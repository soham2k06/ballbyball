import Image from "next/image";

function TestPage() {
  return (
    <div>
      <p>jest test cases</p>
      <Image
        src="/logo.svg"
        alt="logo"
        width={100}
        height={100}
        title="jest test cases"
      />
      <input
        id="name"
        name="name"
        type="text"
        readOnly
        placeholder="enter your name"
        value="soham"
      />
    </div>
  );
}

export default TestPage;
