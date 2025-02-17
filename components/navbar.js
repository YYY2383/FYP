import '../app/globals.css';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const auth = getAuth();
    
    try {
      await signOut(auth);
      router.push('/'); // Redirect user to the login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      <ul>
        <li><Link href="/recipes_view">Home</Link></li>
        <li><Link href="/create">Create Recipe</Link></li>
        <li><Link href="/contact">Contact</Link></li> 
        <li className='outBtn'><button className='logout' onClick={handleLogout}>Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;
