const DoneModal = () => {
    return (
        <>
            <input type="checkbox" id="doneModal" className="modal-toggle" />
<div className="modal">
  <div className="modal-box text-center">
    <h3 className="font-bold text-2xl text-dihliz-500">Account Registered</h3>
    <p className="py-4">Your Account is Created. Please login with the credentials.</p>
    <div className="modal-action">
      <label htmlFor="doneModal" className="btn">Go Back</label>
    </div>
  </div>
</div>
        </>
    );
}

export default DoneModal;