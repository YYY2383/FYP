import '../app/globals.css'
import Link from 'next/link';

const Navbar = () => {
    return (
      <nav className="navbar">
        <ul>
          <li><Link href="/home">Home</Link></li>
          <li><Link href="/create">Create Recipe</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </nav>
    );
  };
  
  export default Navbar;