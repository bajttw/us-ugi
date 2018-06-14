<?php

namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use AppBundle\Entity\Uploads;
use AppBundle\Controller\AppController;
use AppBundle\Utils\UploadHandler as UploadHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UploadsController extends AppController{
    const en='uploads';
    const ec='Uploads';
    
    public function uploadTempAction(){
        $request=$this->getRequest();
        // $id=$request->get('id');
        // $type=$request->get('uploadType');
        // $name=$request->get('name');
        // $path=$request->get('path');
        if (count($request->files->keys())>0){
            $paramName=$request->files->keys()[0];
            $upload_options=['param_name' => $paramName, 'folder' => 'tmp', 'max_width' => 3000, 'max_height' => 3000 ];
            // if ($name !="" && $type==0)//jeśli typ tymczasowy to usunięcie starych plików
            // {
            //     $upload= new Tuploads();
            //     $upload->setName($name);
            //     $upload->setPath($path);
            //     $upload->removeUpload();
            // }
            $handler = new UploadHandler($upload_options );
            $uploaded=$handler->post(false)[$paramName];
            $files=[];
            $ok=true;
            foreach ($uploaded as $file){
                if (isset($file->error)){
                    $files[]= \json_encode(["error" => $file->error]);
                    $ok=false;
                }else{
                    $u = new Uploads();    
                    $u->setFile($file);
                    $files[]= $u->getData();
                }
            }
            return $this->JsonResponse(['files'=> $files], $ok);//!isset($uploaded["files"][0]->error));                
        }
        return $this->JsonResponse(['files'=> []], false);//!isset($uploaded["files"][0]->error));                
    }

        
}
