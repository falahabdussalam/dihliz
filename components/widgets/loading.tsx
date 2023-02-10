import BarLoader from "react-spinners/BarLoader";


const PageLoading = () => {
    return (
        <div className="fixed bg-white h-screen w-screen flex justify-center items-center text-center">

            <div>
            <BarLoader color="#5b0e2d" /> <br />
            Loading...

            </div>
        </div>
    );
}

export default PageLoading;