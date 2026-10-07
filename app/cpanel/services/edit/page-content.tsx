"use client";

import AdminLayout from "@/components/admin/admin_layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { API_KEY } from "@/data/const";
import { ROOT_URL } from "@/data/const";
import PageLoading from "@/components/widgets/loading";

const EditService = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [id, setId] = useState<any>(null);

  const [title, setTitle] = useState<any>(null);
  const [description, setDescription] = useState<any>(null);
  const [thumb, setThumb] = useState<any>(null);
  const [thumbUrl, setThumbUrl] = useState<any>(null);

  const [category, setCategory] = useState<any>(null);

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<any>(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setId(searchParams.get("id"));
  }, [searchParams]);

  useEffect(() => {
    if (id != null) {
      getServiceData();
    }
  }, [id]);

  function getServiceData() {
    fetch(ROOT_URL + "/products/get.php?id=" + id)
      .then((res) => res.json())
      .then((data) => {
        let dat = data.blogs[0];
        setTitle(dat.name);
        setDescription(dat.description);
        setThumbUrl(dat.thumb);
        setCategory(dat.category);
        setIsLoaded(true);
      });
  }

  function submitBlog() {
    if (title != null && category != null) {
      setError(null);
      setLoading(true);
      if (thumb != null) {
        uploadThumb().then((res) => {
          if (res.data.status == "success") {
            updateService(res.data.file).then((resnew) => {
              if (resnew.data.status == "success") {
                setLoading(false);
                router.replace("/cpanel/services");
              } else {
                setError("Something went wrong. Please try again later.");
              }
            });
          } else {
            setError(res.data.message);
          }
        });
      } else {
        updateService(thumbUrl).then((resnew) => {
          if (resnew.data.status == "success") {
            setLoading(false);
            router.replace("/cpanel/services");
          } else {
            setError("Something went wrong. Please try again later.");
          }
        });
      }
    } else {
      if (title == null || category == null) {
        setError("Please fill all the fields");
      } else {
        setError("Please upload a thumbnail.");
      }
    }
  }

  async function uploadThumb() {
    const formData = new FormData();
    formData.append("api", API_KEY);
    formData.append("file", thumb);
    return await axios.post(`${ROOT_URL}/uploads/upload.php`, formData, {
      headers: {
        "content-type": "multipart/form-data",
      },
    });
  }

  async function updateService(thumbUrl: string) {
    const URL = `${ROOT_URL}/products/update.php`;
    const formData = new FormData();

    formData.append("api", API_KEY);
    formData.append("id", id);

    formData.append("name", title);
    formData.append("description", description);
    formData.append("thumb", thumbUrl);
    formData.append("category", category);

    return await axios.post(URL, formData, {
      headers: {
        Accept: "application/json",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });
  }

  const categories = [
    "Signage",
    "Design",
    "Printing",
    "Gift",
    "Tag",
    "Art",
    "Content",
    "Digital",
    "Photography",
    "Event",
  ];

  if (!isLoaded) return <PageLoading />;
  return (
    <AdminLayout active="Services">
      

      {error && (
        <div className="bg-red-200 text-red-700 px-3 py-2 mb-3 rounded">
          {error}
        </div>
      )}
      <br />
      <br />
      <h4 className="text-dihliz-700">Service Name</h4>
      <input
        type="text"
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        defaultValue={title}
        className="input input-bordered w-full mb-5"
        placeholder="Service Name"
      />
      <br />
      <h4 className="text-dihliz-700 ">Description</h4>
      <textarea
        className="textarea input-bordered w-full mb-2"
        defaultValue={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Service Description"
      ></textarea>

      <br />
      <h4 className="text-dihliz-700 ">Category</h4>
      <select
        name=""
        id=""
        className="select input-bordered w-full mb-2"
        onChange={(e) => setCategory(e.target.value)}
      >
        <option disabled>Select a Category</option>
        {categories.map((cat) => {
          return (
            <option value={cat} defaultChecked={cat == category}>
              {cat}
            </option>
          );
        })}
      </select>
      <br />

      <br />
      <h4 className="text-dihliz-700">Blog Thumbnail</h4>
      <input
        type="file"
        className="w-full m2-4"
        placeholder="Thumbnail"
        onChange={(e) => setThumb(e.target.files![0])}
        accept="image/jpeg,image/png"
      />

      {thumb && (
        <img
          src={URL.createObjectURL(thumb)}
          className="w-3/12 mt-4 rounded-lg"
        />
      )}
      {thumb == null && thumbUrl != null ? (
        <img
          src={ROOT_URL + "/uploads/" + thumbUrl}
          className="w-3/12 mt-4 rounded-lg"
        />
      ) : (
        <div></div>
      )}
      <span className="text-red-600 text-sm pt-1 inline-block">
        Image ust be in <b>1000x1000</b>px resolution.
      </span>
      <br />

      <br />

      <br />
      <div className="flex justify-end">
        <button
          className="bg-dihliz-600 hover:bg-dihliz-700 text-white px-6 py-3 rounded mt-3"
          onClick={() => submitBlog()}
        >
          {loading ? (
            <span>
              <img
                src="/img/loading.gif"
                className="mx-4"
                style={{ height: "30px" }}
                alt=""
              />
            </span>
          ) : (
            <span>Update Service</span>
          )}
        </button>
      </div>
    </AdminLayout>
  );
};

export default EditService;
