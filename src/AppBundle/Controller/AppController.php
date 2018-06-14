<?php
namespace AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface as Container;
use Symfony\Component\Form\FormError;
use Doctrine\Common\Collections\ArrayCollection;

use AppBundle\Utils\Utils;
use AppBundle\Entity\Settings;
use AppBundle\Entity\Uploads;
use AppBundle\Entity\Clients;

define("AppBundle", 'AppBundle');

class AppController extends Controller
{
    const en = 'clients';
    const ec = 'Clients';

    protected $clientRoute = false;

    public static $bundleName = AppBundle;// 'AppBundle';
    public static $bundlePath = AppBundle . ':';

    protected $settings = [];
    protected $dictionaries = [];

    protected $entitiesClasses = ['Clients', 'ClientsGroups', 'Settings', 'Uploads', 'Users', 'UsersGroups', 'ServiceCatalog', 'ServiceCatalogPrices', 'ServiceOptions', 'ServiceOptionsPrices', 'ServiceOrders', 'Services', 'ServiceRequests', 'Payments', 'Notes', 'Subcontractors', 'ExternalServices', 'Materials' ];


    protected $entity = null;
    protected $entityId = 0;
    protected $entityNameSpaces = [];

    protected $entityQuery;
    protected $entityQueryFilters = [];



    protected $entitiesSettings = null;
    protected $entitySettings = [];

    protected $entityModal = [];

    protected $comment = [
        'not_found' => '',
    ];
    protected $container;
    protected $user = null;
    protected $client = null;
    protected $admin = false;
    protected $renderTemplate = '';
    protected $renderType='';
    protected $renderOptions = array(
        'template_body' => '',
        'template_errors' => 'form_errors.html.twig',
        'title' => '',
        'entity' => null,
        'entities_settings' => [],
        'ecn' => '',
        'en' => ''
    );
    protected $entityManager = null;
    protected $formOptions;
    protected $formSystem = null;
    protected $parameters;

    protected static $activeFilter = [
        'name' => 'active',
        'data' => [
            ['v' => '1', 'n' => 'aktywny'],
            ['v' => '0', 'n' => 'nieaktywny']
        ],
        'd' => [
            'widget' => 'multiselect'
        ],
        'attr' => [
            'multiple' => 'multiple'
        ]

    ];

    protected static $activeHiddenFilter = [
        'name' => 'active',
        'type' => 'hidden',
        'value' => '1'
    ];



    public function __construct($params = null)
    {
        $this->entityNameSpaces = $this->genEntityNameSpaces();
        if ($params) {
            if (isset($params['query'])) {
                $this->entityQuery = $params['query'];
            }

        }
    }

//  <editor-fold defaultstate="collapsed" desc="Translations">

    public static function gen_trans_text($str, $type, $entityName = null)
    {
        return $str ?
            Utils::gen_trans_text($str, $type, $entityName === '' ? '' : self::getEntityName($entityName) )
            : '';
    }

    public function genTranslateText($str, $type, $entityName = null)
    {
        return self::gen_trans_text($str, $type, $entityName );
    }

    public static function filterLabel($str, $entityName=null){
        return self::gen_trans_text('filter.'.$str, 'label', $entityName );
    }
    
    public static function filterTitle($str, $entityName=null){
        return self::gen_trans_text('filter.'.$str, 'title', $entityName );
    }

    public static function btnLabel($str, $entityName=null){
        return self::gen_trans_text('btn.'.$str, 'label', $entityName );
    }
    
    public static function btnTitle($str, $entityName=null){
        return self::gen_trans_text('btn.'.$str, 'title', $entityName );
    }

    public function titleText($str, $entityName = null)
    {
        return $this->genTranslateText($str, 'title', $entityName);
    }

    public function labelText($str, $entityName = null)
    {
        return $this->genTranslateText($str, 'label', $entityName);
    }

    public function messageText($str, $entityName = null)
    {
        return $this->genTranslateText($str, 'message', $entityName);
    }

    public function errorText($str, $entityName = null)
    {
        return $this->genTranslateText($str, 'error', $entityName);
    }

    public function trans($str, $include=[])
    {
        if(is_null($str) || $str == ''){
            return '';
        }
        $trans=function($s, $include){
            $s = $this->get('translator')->trans($s);
            if($count=count($include)){
                $search=[];
                for($i=1; $i<=$count; $i++){
                    $search[]='%'.$i;
                }
                $s=str_replace($search, $include, $s);
            }
            return $s;
        };
        if (is_array($str)) {
            $t = [];
            foreach ($str as $s) {
                $t[]=$trans($s, $include);
            }
            return implode(' ', $t);
        }
        else {
            return $trans($str, $include);
        }
    }
// </editor-fold>   

//  <editor-fold defaultstate="collapsed" desc="Entity service">
    public function getEntityNameSpaces($entityClassName = null)
    {
        if (is_null($entityClassName)) {
            return $this->entityNameSpaces;
        }
        if (is_array($entityClassName)) {
            return $entityClassName;
        }
        return self::genEntityNameSpaces($entityClassName);
    }

    public static function genEntityNameSpaces($entityClassName = null)
    {
        if (is_array($entityClassName)) {//jeśli było już odkodowane
            return $entityClassName;
        }
        $bn = self::$bundleName;
        $ecn = static::ec;
        if (is_string($entityClassName) && $entityClassName != '') {
            $str = explode(':', $entityClassName);
            if (count($str) > 1) {
                $bn = $str[0];
                $ecn = $str[1];
            }
            else {
                $ecn = $entityClassName;
            }
        }
        $nameSpace = self::getNameSpace('Entity', $ecn);
        return [
            'bundle' => $bn,
            'name' => $nameSpace::en,
            'className' => $ecn,
            'path' => $bn . ':' . $ecn,
            'nameSpace' => $nameSpace,
            'repository' => self::getNameSpace('Repository', $ecn, 'Repository'),
            'controller' => self::getEntityController($ecn),
            'formType' => self::getNameSpace('Form', $ecn, 'Type')
        ];
    }

    public static function controllerFunction($entityController, $functionName, $arguments = null)
    {
        if (method_exists($entityController, $functionName)) {
            return call_user_func_array([$entityController, $functionName], is_array($arguments) ? $arguments : [$arguments]);
        }
        return [];
    }

    public function runFunction($functionName, $argument = null)
    {
        if (method_exists($this, $functionName)) {
            return $argument ? $this->$functionName($argument) : $this->$functionName();
        }
        return null;
    }

    public static function getBundleName($entityPath = null)
    {
        if (is_array($entityPath)) {
            return $entityPath['bundle'];
        }
        $bn = self::$bundleName;
        if (is_string($entityPath)) {
            $str = explode(':', $entityPath);
            if (count($str) > 1) {
                $bn = $str[0];
            }
        }
        return $bn;
    }

    public static function getEntityName($entityClassName = null)
    {
        if (is_array($entityClassName)) {
            return $entityClassName['name'];
        }
        if (is_string($entityClassName) && $entityClassName != '') {
            if(ctype_upper($entityClassName[0])){
                $nameSpace = self::getNameSpace('Entity', $entityClassName);
                return $nameSpace::en;
            }
            return $entityClassName;
        }
        return static::en;
    }

    public static function getEntityClassName($entityClassName = null)
    {
        if (is_array($entityClassName)) {
            return $entityClassName['className'];
        }
        $ecn = static::ec;
        if (is_string($entityClassName) && $entityClassName != '') {
            $str = explode(':', $entityClassName);
            if (count($str) > 1) {
                $ecn = $str[1];
            }
            else {
                $ecn = $entityClassName;
            }
        }
        return $ecn;
    }

    public static function getNameSpace($name, $entityClassName = '', $suffix = '')
    {
        if (is_array($entityClassName)) {
            $bn = $entityClassName['bundle'];
            $ecn = $entityClassName['className'];
        }
        else {
            $bn = static::$bundleName;
            $ecn = static::ec;
            if (is_string($entityClassName) && $entityClassName != '') {
                $str = explode(':', $entityClassName);
                if (count($str) > 1) {
                    $bn = $str[0];
                    $ecn = $str[1];
                }
                else {
                    $ecn = $entityClassName;
                }
            }
        }
        return $bn . '\\' . ucfirst($name) . '\\' . $ecn . $suffix;
    }

    public static function getEntityPath($entityClassName = null)
    {
        if (is_array($entityClassName)) {
            return $entityClassName['path'];
        }
        return (static::$bundleName).':'.( is_null($entityClassName) ? static::ec : $entityClassName); 
    }

    public static function getEntityController($entityClassName = '')
    {
        if (is_array($entityClassName)) {
            return $entityClassName['controller'];
        }
        return self::getNameSpace('Controller', $entityClassName, 'Controller');
    }

    public static function getEntityRepository($entityClassName = '')
    {
        if (is_array($entityClassName)) {
            return $entityClassName['repository'];
        }
        return self::getNameSpace('Repository', $entityClassName, 'Repository');
    }

    protected function newEntity()
    {
        if (!$this->entity) {
            $this->entity = new $this->entityNameSpaces['nameSpace'](['controller' => $this, 'defaults' => Utils::deep_array_value('defaults', $this->entitySettings)]);
            $this->runFunction('newCustomEntity');
        }
        return $this;
    }

    protected function newEntityGenerator()
    {
        if (!$this->entity) {
            $this->entity=new \stdClass();
            $this->entity->items= new ArrayCollection();
        }
        return $this;
    }
    
// </editor-fold>   

//  <editor-fold defaultstate="collapsed" desc="Routing">

    protected function getRoute($routeSuffix = null, $entityClassName = null, $clientRoute = null)
    {
        $route='';
        if($this->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN')){
            $route='app_admin_';
        }else if($this->get('security.authorization_checker')->isGranted('ROLE_USER')){
            $route='app_employee_';
        }else if($this->get('security.authorization_checker')->isGranted('ROLE_USER')){
            $route='app_client_';
        }
        $route.=$this->getEntityName($entityClassName);
        if ($this->isAdmin()) {
            if ($clientRoute == true || (is_null($clientRoute) && $this->clientRoute && $this->isClient())) {
                $route.='_client';
            }
        }        
        $route.= isset($routeSuffix) ? '_' . $routeSuffix : '';
        return $route;
    }

    protected function getSystemUrl($route, $parameters = [])
    {
        $def_param = [];
        if ($this->isClient()) {
            $def_param['cid'] = $this->client->getId();
        }
        if ($this->entityId > 0) {
            $def_param['id'] = $this->entityId;
        }
        return $this->generateUrl($route, array_replace_recursive($def_param, $parameters));
    }

    protected function getUrl($routeSuffix = null, $entityClassName = null, $isClient = null, $parameters = [])
    {
        return $this->getSystemUrl($this->getRoute($routeSuffix, $entityClassName, $isClient), $parameters);
    }

    public function getRequest()
    {
        return $this->container->get('request_stack')->getCurrentRequest();
    }

    protected function setReturnUrl()
    {
        $this->renderOptions['return_url'] = $this->getRequest()->headers->get('referer');
        return $this;
    }

// </editor-fold>   
    
//  <editor-fold defaultstate="collapsed" desc="Rendering">

    protected function tmplPath($name, $entityClassName = '', $subdir = '', $bundleName = null)
    {
        $subdir = ucfirst($subdir);
        $path = $subdir != '' ? $subdir . '/' . $name : $name;
        if (!is_array($entityClassName) && property_exists($this, 'ownTemplate') && in_array($path, $this->ownTemplate)) {
            $entityClassName = null;
        }
        if (is_null($entityClassName) || $entityClassName !='') {
            $bundleName = is_null($bundleName) ? $this->getBundleName($entityClassName) : $bundleName;
            $entityClassName = $this->getEntityClassName($entityClassName);
            }
        return ($bundleName ? '@'.str_replace('Bundle', '', $bundleName).'/' : '' ).($entityClassName!='' ? $entityClassName.'/' : '').$path . '.html.twig';
        }

    protected function setTemplate($name, $entityClassName = '')
    {
        $this->renderTemplate = $this->tmplPath($name, $entityClassName, $this->typeTemplate($this->renderType));
        return $this;
    }

    protected function typeTemplate($type = null){
        $subdir = '';
        switch ($type) {
            case 'm' :
                $subdir = 'Modal';
                break;
            case 'p' :
                $subdir = 'Panel';
                break;
            case 'w' :
                $subdir = 'Window';
                break;
            default :
                break;
        }
        return $subdir;
    }

    protected function setFormTemplate($entityClassName = '', $name='edit')
    {
        if (!$this->renderTemplate) {
            $this->renderTemplate = $this->tmplPath($name, $entityClassName, $this->typeTemplate($this->renderType));
        }
        return $this;
    }

    protected function setRenderOptions($options = [])
    {
        $default = [
            'template_body' => $this->tmplPath( 'form', static::ec),
            'entity' => is_object($this->entity) ? $this->entity : null,
            'en' => static::en,
            'ecn' => static::ec,
            'admin' => $this->isAdmin(),
            'upload_route' => 'app_uploads_temp'
        ];
        $this->renderOptions = array_replace_recursive($this->renderOptions, $default, $options);
        $this->renderOptions['entities_settings'] = $this->getEntitiesSettings();
        $this->renderOptions['layout'] = Utils::deep_array_value('view', $_REQUEST) ? 'content' : 'layout_dev';
        return $this;
    }

    protected function renderSystem($genFormView = false)
    {
        if ($genFormView) {
            $this->renderOptions['form'] = $this->formSystem->createView();
        }
        return $this->render($this->renderTemplate, $this->renderOptions);
    }

    protected function renderSystemView($genFormView = false)
    {
        if ($genFormView) {
            $this->renderOptions['form'] = $this->formSystem->createView();
        }
        return $this->renderView($this->renderTemplate, $this->renderOptions);
    }

// </editor-fold>   

// <editor-fold defaultstate="collapsed" desc="Actions">

    public function getEntityFieldFromJson(Request $request, $fieldName="id")
    {
        $idArray=[];
        $content=$request->getContent();
        if (!empty($content))
        {
            $enties = json_decode($content, true);
            foreach ($enties as $entity) {
                $idArray[]=$entity[$fieldName];
            }
        }
        return $idArray;
    }

    public function loginRedirectAction(Request $request)
    {

        if (!$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY'))
        {
            return $this->redirectToRoute('login');
        }

        if($this->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN'))
        {
            return $this->redirectToRoute('app_admin');
        }
        else if($this->get('security.authorization_checker')->isGranted('ROLE_USER'))
        {
            return $this->redirectToRoute('app_employee');
        }
        else if($this->get('security.authorization_checker')->isGranted('ROLE_USER'))
        {
            return $this->redirectToRoute('app_client');
        }
        else
        {
            return $this->redirectToRoute('login');
        }

    }

    protected function preAction(Request $request, $cid = 0, $options = [])
    {
        $default = [
            'checkPrivilages' => 0,
            'entitySettings' => true,
        ];
        $this->renderType = $request->query->get('type');        
        $o = array_replace_recursive($default, $options);
        if ($cid == 0) {
            $cid = $request->query->get('cid');
        }
        if ($cid != 0) {
            $this->findClient($cid);
        }
        if ($o["checkPrivilages"] >= 0 && !$this->checkPrivilages($o["checkPrivilages"] == 1)) {
            return false;
        }
        if ($o['entitySettings']) {
            $this->genEntitiesSettings();
            $this->entitySettings = $this->getEntitySettings(static::ec);
        }
        return true;
    }

    public function indexAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied();
        }
        $this->setTemplate('index');
        $this->setRenderOptions([
            'title' => $this->titleText('index'),
            'toolbars' => [
                $this->genToolbar(),
                $this->genFilterbar()
            ],
            'table' => $this->genTable(null, 'index', ['actions' => 'index'])
        ])
            ->addEntityModal();
        return $this->renderSystem();
    }

    public function ajaxTestAction(Request $request)
    {
        $queryStr=$request->query->get('q');
        $queryStr="SELECT e.id, e.generated, COUNT(pg.id) - SIZE(e.positions) as pg_count, c.name
        FROM AppBundle\Entity\Orders e 
        JOIN e.positions p 
        JOIN p.package pg 
        JOIN p.size s
        join e.client c
        
        WHERE e.generated > '2017-01-01' 
        GROUP BY e
        ORDER BY e.id ASC";

        $queryStr="SELECT e FROM AppBundle\Entity\Orders e 
        LEFT JOIN e.client e_client 
        LEFT JOIN e_client.ways e_client_ways 
        LEFT JOIN e.positions e_positions 
        WHERE e_client_ways.id IN ('4') AND (e.approved BETWEEN '2015-05-14 00:00:00' AND '2017-11-14 23:59:59') AND e_positions.package IS NULL AND e.actualState NOT IN(1, 5) AND e_positions.size = 1 GROUP BY e.id";

        $queryStr="SELECT e.id AS id, partial e_client.{id, name, code}, e.number AS nr 
        FROM AppBundle\Entity\Orders e 
        LEFT JOIN e.client e_client";

        $queryStr="SELECT partial e.{id as id, number as nr} , partial e_client.{id, name, code} 
        FROM AppBundle\Entity\Orders e 
        LEFT JOIN e.client e_client";

        $query=$this->getEntityManager()->createQuery($queryStr);
        $result= $query->getArrayResult();
       
        return new JsonResponse($result);
    }

    public function ajaxListAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid, ['entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }
        return new JsonResponse($this->getEntiesFromBase($request, 'getList'));
    }

    public function clientAjaxListAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid, ['entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }
        $defaultFilters=$this->getFilters('table_client', [
            'cid' => $cid
        ]);
        $filters = $request->query->get('f');
        return new JsonResponse($this->getEntiesFromBase($request, 'getList', [ 
            'filters' => isset($filters) ? 
                array_replace_recursive($defaultFilters, json_decode($filters, true)) : 
                $defaultFilters 
            ])
        );
    }

    public function ajaxDicAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid, ['entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }
        return new JsonResponse($this->getEntiesFromBase($request, 'getDic'));
    }

    public function ajaxListDetailsAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid, ['entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }
        $this->entityQuery = null;
        $entities = $this->getEntiesFromBase($request, 'getEntities');
        $results = [];
        foreach ($entities as $entity) {
            $results[] = $entity->getShowData(false, [ 
                'type' => 'details',
                'shortNames' => true
            ]);
        }
        return new JsonResponse($results);
    }

    public function ajaxDataAction(Request $request, $id, $cid = 0)
    {
        if (!$this->preAction($request, $cid, ['entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }
        $this->getEntityFromBase($id);
        return new JsonResponse(['entity' => $this->entity->getShowData()]);
    }

    public function showAction(Request $request, $id, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied();
        }
        $this->getEntityFromBase($id);
        $this->setTemplate('show')
            ->setRenderOptions([
            'title' => $this->titleText('show'),
            'entity' => $this->entity->getShowData(false, ['shortNames' => false])
        ]);
        return $this->renderSystem();
    }

    public function newAction(Request $request, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied();
        }
        $this->setFormTemplate();
        $this->createCreateForm();
        if (method_exists($this, 'customNewAction')) {
            $this->customNewAction($request, $cid);
        }
        return $this->renderSystem(true);
    }

    public function createAction(Request $request, $cid = 0)
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->responseMustAjax();
        }
        $dataReturn = [];
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied(true);
        }
        $this
            ->createCreateForm()
            ->formSystem->handleRequest($request);
        if ($this->formSystem->isValid()) {
            if (property_exists($this->entity, 'upload')) {
                $this->entity->checkUpload();
            }
            if (method_exists($this, 'customCreateAction')) {
                $this->customCreateAction($dataReturn);
            }
            return $this->responseSave('create', $dataReturn);
        }
        return $this->errorsJsonResponse( 'create',  $dataReturn);
    }

    public function generateAction(Request $request, $cid=0){
        if (!$this->preAction($request, $cid, ['checkPrivilages' => 1, 'entitySettings' => false])) {
            return $this->responseAccessDenied(true);
        }            
        $this->setFormTemplate('', 'generate');
        $this->createGenerateForm(
            [
                'attr' => [
                    'data-uniques' =>  json_encode($this->getEntityManager()->getRepository($this->entityNameSpaces['path'])->getUniques())
                ]
            ]
        );
        if (method_exists($this, 'customGenerateAction')) {
            $this->customGenerateAction( $request, $cid);
        }
        return $this->renderSystem(true);
    }

    public function addAction(Request $request, $cid = 0)
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->responseMustAjax();
        }
        $dataReturn = [];
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied(true);
        }
        $this
            ->createGenerateForm()
            ->formSystem->handleRequest($request);
        if ($this->formSystem->isValid()) {
            $dataReturn['count']=$this->entity->items->count();
            $uniques =  $this->getEntityManager()->getRepository($this->entityNameSpaces['path'])->getUniques();
            foreach($this->entity->items as $item){
                if (method_exists($item, 'getUnique') && (array_key_exists($item->getUnique(), $uniques))){
                    $this->entity->items->removeElement($item);
                }
            }
            if (method_exists($this, 'customAddAction')) {
                $this->customAddAction( $dataReturn);
            }           
            return $this->responseSaveMany($this->entity->items, 'add', $dataReturn);
        }
        return $this->errorsJsonResponse( 'add',  $dataReturn);
    }
    

    public function editAction(Request $request, $id, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied();
        }
        $this->setFormTemplate();
        $this->createEditForm($id);
        if (method_exists($this, 'customEditAction')) {
            $this->customEditAction($request, $id, $cid);
        }
        return $this->renderSystem(true);
    }

    public function updateAction(Request $request, $id, $cid = 0)
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->responseMustAjax();
        }
        $dataReturn = [];
        if (!$this->preAction($request, $cid)) {
            return false;
        }
        $this->createEditForm($id);
        $this->entity->preUpdate();

        if (method_exists($this, 'preUpdateAction')) {
            $this->preUpdateAction($request, $id, $cid);
        }
        $this->formSystem->handleRequest($request);
        if ($this->formSystem->isValid()) {
            $this->entity->postUpdate($this->getEntityManager());
            if (method_exists($this, 'customUpdateAction')) {
                $this->customUpdateAction($dataReturn);
            }
            return $this->responseSave('update', $dataReturn);
        }
        return $this->errorsJsonResponse('update', $dataReturn);
    }

    public function deleteAction(Request $request, $id, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied();
        }
        $this->setFormTemplate();
        $this->createDeleteForm($id);
        return $this->renderSystem(true);
    }

    public function removeAction(Request $request, $id, $cid = 0)
    {
        if (!$this->preAction($request, $cid)) {
            return $this->responseAccessDenied(true);
        }
        $dataReturn = [];
        if ($this->getEntityFromBase($id)) {
            $this->createDeleteForm($id);
            $this->formSystem->handleRequest($request);
            if ($this->formSystem->isValid()) {
                if ($this->formData->confirm) {
                    $dataReturn=$this->entity->remove();
                    if (method_exists($this, 'customRemoveAction')) {
                        $this->customRemoveAction($dataReturn);
                    }
                    return $this->responseSave('remove', $dataReturn, 'remove');
                }else{
                    $dataReturn['errors']['childs'][]=$this->errorMessage(['message' => 'not_confirmed']);
                }
            }
        }else{
            $dataReturn['errors']['childs'][]=$this->errorMessage(['message' => 'not_found']);
        }
        return $this->errorsJsonResponse('remove', $dataReturn);
    }

// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Forms">
    protected function setFormOptions($type, $options = [])
    {
        $default = [
            'em' => $this->getDoctrine()->getManager(),
            'translator' => $this->get('translator'),
            'action' => $this->getUrl($type),
            'attr' => [
                'data-admin' => $this->isAdmin(),
                'data-entity-id' => $this->entityId ? $this->entityId : '',
                'data-form' => 'ajax'
            ],
            'form_admin' => $this->isAdmin(),
        ];
        switch ($type) {
            case 'remove' :
                $default['method'] = 'DELETE';
                break;
            case 'update' :
                $default['method'] = 'PUT';
                break;
            case 'create' :
            case 'add':
            default :
                $default['method'] = 'POST';
        }
        if (Utils::deep_array_key_exists('attr-class', $this->formOptions) && Utils::deep_array_key_exists('attr-class', $options)) {
            Utils::addClass($this->formOptions, $options['attr']['class'], 'attr');
            unset($options['attr']['class']);
        }
        $this->formOptions = array_replace_recursive($this->formOptions, $default, $options);
        Utils::addClass($this->formOptions, ['ajaxCarlack', static::en], 'attr');
        if ($type != 'remove') {
            $this->formOptions['entities_settings'] = $this->getEntitiesSettings();
            $this->runFunction('setCustomFormOptions');
        }
        return $this;
    }

    protected function createEntityForm()
    {
        $this->formSystem = $this->createForm($this->entityNameSpaces['formType'], $this->entity, $this->formOptions);
        return $this;
    }

    protected function createCreateForm($options = [])
    {
        $this->newEntity();
        $this->setFormOptions('create', $options);
        $this->setRenderOptions([
            'title' => $this->titleText('new'),
            'form_options' => [
                'submit' => self::genSubmitBtn('create')
            ]
        ]);
        $this->createEntityForm();
        return $this;
    }

    protected function createGenerateForm($options = [])
    {
        $this->newEntityGenerator();
        $this->setFormOptions('add', $options);
        $this->formOptions['attr']['data-form'] = static::en . 'generate';
        $this->setRenderOptions([
            'title' => $this->titleText('generate'),
            'template_body' => $this->tmplPath( 'generate_body', static::ec),
            'form_options' => [
                'submit' => self::genSubmitBtn('save')
            ]
        ]);
        $this->formSystem = $this->createForm(self::getNameSpace('Form', static::ec . "Generate", 'Type'), $this->entity, $this->formOptions);
        return $this;
    }

    protected function createEditForm($id, $options = [])
    {
        if (!$this->entity) {
            $this->getEntityFromBase($id);
        }
        $this->setFormOptions('update', $options);
        $this->setRenderOptions([
            'title' => $this->titleText('edit'),
            'form_options' => [
                'submit' => self::genSubmitBtn('update')
            ]
        ]);
        $this->createEntityForm();
        return $this;
    }

    protected function createDeleteForm($id, $options = [])
    {
        if (!$this->entity) {
            $this->getEntityFromBase($id);
        }
        $this->formData = new \stdClass();
        $this->formData->id = $id;
        $this->formData->confirm = false;
        $this->setFormOptions('remove');
        $renderOptions = [
            'title' => $this->titleText('delete'),
            'template_body' => $this->tmplPath('delete', '', 'Form'),
            'form_options' => [
                'submit' => self::genSubmitBtn('remove')
            ],
            'entity_name' => static::en
        ];
        if (method_exists($this->entity, 'getDataDelete')) {
            $renderOptions['entity'] = $this->entity->getDataDelete();
        }
        else {
            $renderOptions['entity'] = ['id' => $this->entity->getId()];
            if (method_exists($this->entity, 'getName')) {
                $renderOptions['entity']['name'] = $this->entity->getName();
            }
        }
        $this->setRenderOptions($renderOptions);
        $this->formSystem = $this->createForm(static::$bundleName . '\\Form\\DeleteType', $this->formData, $this->formOptions);
        return $this;
    }
    

// </editor-fold>  

//  <editor-fold defaultstate="collapsed" desc="Parameters">
    
    /*
     * Obsługa parametrów
     */
    protected function getParameters()
    {
        if (!$this->parameters) {
            $this->parameters = $this->container->getParameter('app');
            // $this->positionParameters=$this->container->getParameter('_system.position');
            $this->renderOptions['parameters'] = json_encode($this->parameters);
        }
        return $this->parameters;
    }
    
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Utilites">
    
    protected function removeElementsFromCollection($oldElements, $elements)
    {
        foreach ($oldElements as $oldElement) {
            if (false === $elements->contains($oldElement)) {
                $this->getEntityManager()->remove($oldElement);
            }
        }
    }

    public function getEntityManager()
    {
        if (!$this->entityManager) {
            $this->entityManager = $this->getDoctrine()->getManager();
        }
        return $this->entityManager;
    }
    public function isAdmin()
    {
        $this->admin = $this->container->get('security.authorization_checker')->isGranted('ROLE_ADMIN');
        $this->formOptions['form_admin'] = $this->admin;
        return $this->admin;
    }
    public function isClient()
    {
        return ($this->client != null);
    }
    public function checkPrivilages($onlyAdmin = true)
    {
        $this->user = $this->container->get('security.token_storage')->getToken()->getUser();
        return (($onlyAdmin && $this->isAdmin()) || (!$onlyAdmin && ($this->isAdmin() || ($this->isClient() && $this->user->hasClient($this->client))) ));
    }

    public function addEntityModal($entityClassName = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $default = [
            'name' => $ens['name'],
            'en' => $ens['name'],
            'ecn' => $ens['className'],
            'd' => [],
            'attr' => [
                'class' => 'ajax'
            ]
        ];
        $settings = $this->controllerFunction($ens['controller'], 'getModal');
        return $this->addModal(array_replace_recursive($default, $settings, $options));
    }

    public function addModal($modal)
    {
        $name = $modal['name'];
        $ecn = Utils::deep_array_value('ecn', $modal, '');
        $en = Utils::deep_array_value('en', $modal);
        if(is_null($en) && $ecn ){
            $en=$this->getEntityName($ecn);
        }
        $fillData = Utils::deep_array_value('fillData', $modal, false);
        $default = [
            'title' => $this->genTranslateText($name, 'modal.title', $ecn),
            'd' => [
                'method' => 'POST',
                'options' => [
                    'ecn' => $ecn,
                    'en' => $en
                ]
            ],
            'attr' => [
                'id' => $name . '_modal'
            ]
        ];
        if ($fillData && !array_key_exists('data', $modal)) {
            $default['data'] = $ecn != '' ? $this->getEntityManager()->getRepository('AppBundle:' . $ecn)->getList() : null;
        }
        if (!array_key_exists('settings', $modal)) {
            $default['settings'] = $ecn ? $this->getEntitySettings($ecn) : $this->getSettingValue('modal-'.$name);
        }
        $this->renderOptions['modals'][] = array_replace_recursive($default, $modal);
        return $this;
    }

    protected function customModalField($modal)
    {
        $ecn = Utils::deep_array_value('ecn', $modal);
        if (\array_key_exists('dic', $modal)) {
            if (!is_array(Utils::deep_array_value('data', $modal))) {
                $modal['data'] = $this->getDic(is_string($modal['dic']) ? $modal['dic'] : $ecn);
            }
            $imgWidth = Utils::deep_array_value('image-width', $this->getEntitySettings($ecn));
            if ($imgWidth) {
                $imgColumns = Utils::deep_array_value('image-columns', $this->getEntitySettings($ecn), intval(600 / $imgWidth));
                $modal['dialog_attr']['style'] = Utils::deep_array_value('dialog_attr-style', $modal, '') . 'max-width:' . ($imgColumns * $imgWidth + 100) . 'px;';
            }
        }
        return $modal;
    }

    protected function addModalsField($modals)
    {
        $default = [
            'content' => $this->tmplPath('field', '', 'Modal'),
            'attr' => [
                'class' => 'modal-field',
            ],
            'd' => [
                'set-focus' => '.field'
            ]
        ];
        foreach ($modals as $modal) {
            $this->addModal(array_replace_recursive($default, $this->customModalField($modal)));
        }
        return $this;
    }

    protected function addExpModal($entityClassName = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $this->addModalsField([
            array_replace_recursive(
                [
                    'ecn' => $ens['className'],
                    'name' => $ens['name'] . '_exp',
                    'fieldtype' => 'textarea',
                    'field_attr' => [
                        'id' => $ens['name'] . '_exp_copy',
                        'rows' => 10,
                        'cols' => 25,
                        'data-widget' => 'copytextarea',
                    ],
                    'showSave' => false,
                    'd' => [
                        'set-focus' => ''
                    ]
                ],
                $options
            )
        ]);
        return $this;
    }

    public function addShowModal($entityClassName = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $modal = $this->controllerFunction($ens['controller'], 'getModal');
        $modal['name'] = $ens['name'] . '_show';
        $modal['content'] = $this->tmplPath( 'show', $ens, 'modal');
        $modal['addClass'][] = 'modal-show';
        $this->addModal(array_replace_recursive($modal, $options));
        return $this;
    }

    public function addTableExportModal($entityClassName = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $modal = $this->controllerFunction($ens['controller'], 'getModal');
        $modal['en'] = $ens['name'];
        $modal['ecn'] = $ens['className'];
        $modal['name'] = $ens['name'] . '_table_export';
        $modal['content'] = $this->tmplPath( 'tableExport', '', 'modal', 'App' );
        $modal['addClass'][] = 'modal-table-export';
        $this->addModal(array_replace_recursive($modal, $options));
        return $this;
    }
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Database">

    public function getEntiesFromBase(Request $request, $functionName = null, $options = [])
    {
        $filters = $request->query->get('f');
        $order = $request->query->get('o');
        $filters = isset($filters) ? json_decode($filters, true) : [];
        $defaultOptions = [
            'filters' => array_replace_recursive($this->entityQueryFilters, $filters)
        ];
        if(isset($order)){
            $defaultOptions['order'] = json_decode($order, true);
        }
        if (isset($this->entityQuery)) {
            $defaultOptions['query'] = $this->entityQuery;
        }
        $function = isset($functionName) ? $functionName : 'getAll';
        return $this->getEntityManager()->getRepository($this->entityNameSpaces['path'])->$function(array_replace_recursive($defaultOptions, $options));
    }

    protected function getEntityFromBase($condition, $entityClassName = null)
    {
        $this->entity = $this->getFromBase($condition, $entityClassName);
        if ($this->entity) {
            $this->entityId = $this->entity->getId();
        }
        return $this->entity;
    }

    public function getFromBase($condition, $entityClassName = null, $exeption=false)
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $repository = $this->getEntityManager()->getRepository($ens['path']);
        $entity = is_array($condition) ? $repository->findOneBy($condition) : $repository->find($condition);
        if (!$entity && $exeption) {
            throw $this->createNotFoundException($this->trans(['message.base_error', $ens['name'] . '.message.' . 'notFound']) . ' - ' . (is_array($condition) ? "Warunki wyszukiwania: " . json_encode($condition) : 'ID: ' . $condition));
        }
        return $entity;
    }

    public function getEntityCount($entityClassName = null)
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        return $this->getEntityManager()->getRepository($ens['path'])->getCount();
    }

    protected function findClient($cid)
    {
        if ($cid > 0) {
            $this->client = $this->getClientsRepository()->find($cid);
            if (!$this->client) {
                throw $this->createNotFoundException($this->trans(['message.error', 'clients.notFound']));
            }
            $this->renderOptions['client_name'] = $this->client->getName();
            $this->renderOptions['client_id'] = $this->client->getId();
        }
        return $this->client;
    }
    
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Settings">

    public function getSettingsRepository(){
        return $this->getEntityManager()->getRepository(Settings::class);
    }

    public function getClientsRepository(){
        return $this->getEntityManager()->getRepository(Clients::class);
    }

    public function getSettingValue($name, $asJSON = false)
    {
        $setting=Utils::deep_array_value($name, $this->settings);
        if(is_null($setting)){
            $setting=$this->getSettingsRepository()->getSettingValue($name);
            Utils::deep_array_value_set($name, $this->settings, $setting, true);
        }
        return $asJSON ? json_encode($setting) : $setting;
    }

    public function getSettingsValue($namePrefix, $asJSON= false){
        $settings=Utils::deep_array_value($namePrefix, $this->settings);
        if(is_null($settings)){
            $settings=$this->getSettingsRepository()->getSettingsValue($namePrefix);
            Utils::deep_array_value_set($namePrefix, $this->settings, $settings, true);
        }
        return $asJSON ? json_encode($settings) : $settings;
    }

    public function saveSetting($name, $value)
    {
        $setting = $this->getSettingsRepository()->getSetting($name);
        if (!isset($setting)) {
            $setting = new Settings();
            $setting->setName($name);
        }
        $this->settings[$name]=$value;
        $setting->setValue($value);
        $this->getEntityManager()->persist($setting);
        $this->getEntityManager()->flush();
    }
    
    public function getClientSettingValue($client, $name, $asJSON = false)
    {
        $setting = $this->getSettingsRepository()->getSettingValue($name, [ 'clients' => $client->getId() ]);
        return $asJSON ? json_encode($setting) : $setting;
    }

    public function getClientSettingsValue($client, $namePrefix, $asJSON = false)
    {
        $settings = $this->getSettingsRepository()->getSettingsValue($namePrefix, [ 'clients' => $client->getId() ]);
        return $asJSON ? json_encode($settings) : $settings;
    }
   
    public function saveClientSetting($client, $name, $value)
    {
        $setting = $this->getSettingsRepository()->getSetting($name, [ 'clients' => $client->getId() ] );
        if (!isset($setting)) {
            $setting = new Settings();
            $setting->setClient($client);
            $setting->setName($name);
        }
        $setting->setValue($value);
        $this->getEntityManager()->persist($setting);
        $this->getEntityManager()->flush();
    }

    protected function genEntitySettings($controller, $entityClassName = null)
    {
        $ens = self::genEntityNameSpaces($entityClassName);
        $bp = str_replace('bundle', '', strtolower($ens['bundle']));
        $prefix = $ens['bundle'] == AppBundle ? $ens["name"] : $bp . '_' . $ens["name"];
        $settings = $this->getSettingsValue($prefix);
        $settings['bp'] = $bp;
        $settings['entityNameSpace'] = $ens["nameSpace"];
        $settings['es'] = $ens;
        $settings['en'] = $ens["name"];
        $settings['ecn'] = $ens["className"];
        $settings['fields'] = $ens["nameSpace"]::$shortNames;
        if (method_exists($ens["controller"], 'genCustomSettings')) {
            $ens["controller"]::genCustomSettings($controller, $settings);
        }
        if (!is_array($this->entitiesSettings)){
            $this->entitiesSettings=[];
        } 
        $this->entitiesSettings[$ens["className"]]=$settings;
        return $settings;
    }

    protected function genEntitiesSettings($eClasses = null){
        $this->entitiesSettings = [];
        if (!is_array($eClasses) || count($eClasses)==0 ) {
            $eClasses = $this->entitiesClasses;
        }
        foreach ($eClasses as $ec) {
            $this->genEntitySettings($this, $ec);
        }
        return $this->entitiesSettings;
    }

    public function getEntitiesSettings($eClasses = '')
    {
        if (is_array($this->entitiesSettings) && count($this->entitiesSettings) > 0) {
            return $this->entitiesSettings;
        }
        return $this->genEntitiesSettings();
    }

    public function getEntitySettings( $entityClassName = null)
    {
        $ens = self::genEntityNameSpaces($entityClassName);
        if (is_array($this->entitiesSettings) && array_key_exists($ens['className'], $this->entitiesSettings)){
            return $this->entitiesSettings[$ens['className']];
        }
        return $this->genEntitySettings($ens);
    }

    protected function genDic($entityClassName = null)
    {
        $ens = self::genEntityNameSpaces($entityClassName);
        $this->dictionaries[$ens['className']] = $this->getEntityManager()->getRepository($ens['path'])->getDic();
        return $this->dictionaries[$ens['className']];
    }

    public function getDic($entityClassName = null)
    {
        $ens = self::genEntityNameSpaces($entityClassName);
        if (array_key_exists($ens['className'], $this->dictionaries)) {
            return $this->dictionaries[$ens['className']];
        }
        return $this->genDic($ens);
    }

    protected function tableSettingsFromBase($entityClassName = null, $tableType = 'index')
    {
        $ens = self::genEntityNameSpaces($entityClassName);
        $ep = $ens['bundle'] == AppBundle ? $ens["name"] : str_replace('bundle', '', strtolower($ens['bundle'])) . '_' . $ens["name"];
        $prefix = "tables-" . $ep;
        $type = strtolower($tableType);
        $table = $this->getSettingValue($prefix . "-" . $type);
        if (!is_array($table)) {
            $tables = $this->getSettingValue( $prefix);
            $table = is_array($tables) && is_array($tables[$type]) ? $tables[$type] : [];
        }
        return $table;
    }





    
// </editor-fold>

// <editor-fold defaultstate="collapsed" desc="Generate functions">

    public static function genSubmitBtn($type)
    {
        return [
            'attr' => [
                'value' => $type,
                'title' => self::btnTitle($type),
                'class' => $type == 'remove' ? 'btn-danger' : 'btn-success',
                'style' => $type == 'remove' ? "disabled:true" : ""
            ]
        ];
    }

    protected function genActions($entityClassName = null, $actions = 'view', $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $en = $ens['name'];
        if (!is_array($actions)) {
            $actions = $this->controllerFunction($ens['controller'], 'getActions', [ $actions ] );
        }
        if (count($actions) == 0) {
            return null;
        }
        $ac = [];
        $urls = [];
        foreach ($actions as $action) {
            $an = $action['action'];
            $action['attr']['class'] = 'btn-img btn-' . $an . (isset($action['attr']['class']) ? ' ' . $action['attr']['class'] : '');
            if (!isset($action['attr']['title'])) {
                $action['attr']['title'] = $this->titleText( 'btn.'.$an, $en );
            }
            $type = Utils::deep_array_value('type', $action, 'f');
            if ($type != 'f') {
                $target = '#' . (!isset($action['target']) || $action['target'] == '1' ? 'my' : $action['target']) . '_';
                switch ($type) {
                    case 'm' :
                        $action['d']['toggle'] = 'modal';
                        $action['d']['target'] = $target . 'modal';
                        break;
                    case 'p' :
                        $action['d']['target'] = $target . 'panel';
                        break;
                }
            }
            if (Utils::deep_array_value('browserAction', $action)) {
                $action['d']['action'] = $an;
                $src = Utils::deep_array_value('src', $action);
                if (isset($src)) {
                    $urls[$an] = is_array($src) ? $src['url'] : $this->getUrl($src, $ens, false, ['id' => '__id__']);
                }
            }
            else {
                $action['attr']['href'] = $this->getUrl($an, $ens, false, ['id' => '__id__', 'type' => $type]);
                if($type == 'w'){
                    $action['attr']['target']=Utils::deep_array_value('target', $action, '_blank');
                }
                $action['d']['url'] = $action['attr']['href'];
            }
            $ac[] = $action;
        }
        $default = [
            'name' => $en,
            'actions' => $ac
        ];
        return [
            'urls' => $urls,
            'tmpl' => $this->render($this->tmplPath('actions'), array_replace_recursive($default, $options))->getContent()
        ];
    }

    protected function genFilterbar($entityClassName = null, $filtersType = 'index', $template = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $en = $ens['name'];
        $filters = $this->controllerFunction($ens['controller'], 'getFilters', [ $filtersType, $options ]);
        if (count($filters) == 0) {
            return null;
        }
        $id = $en . '_filterbar';
        $fs = [];
        $hfs = [];
        foreach ($filters as $filter) {
            if (Utils::deep_array_value('type', $filter) == 'hidden') {
                $hfs[$filter['name']] = [
                    'value' => Utils::deep_array_value('value', $filter),
                    'options' => Utils::deep_array_value('options', $filter, [])
                ];
            }
            else {
                $filter['attr']['id'] = $id . '_' . $filter['name'];
                $filter['attr']['name'] = $id . '[' . $filter['name'] . ']';
                $filter['banned']= \array_key_exists('banned', $filter) ? (\is_string($filter['banned']) ? $this->getSetting($filter['banned']) : $filter['banned']) : null;
                if (!isset($filter['data'])) {
                    if (isset($filter['source'])) {
                        $source=$filter['source'];
                        switch ($source['type']) {
                            case 'settings' :
                                $filter['data'] = $this->getSettingValue($source['query']);
                                if(\is_array($filter['banned'])){
                                    foreach($filter['banned'] as $b){
                                        for($i=0; $i< count($filter['data']); $i++){
                                            if($filter['data'][$i]['v']== $b){
                                                \array_splice($filter['data'], $i, 1);
                                                break;
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'query' :
                            // $fs[$i]['data']=$this->getEntityManager()->createQuery($fs[$i]['source']['query'])->getArrayResult();
                                break;
                            case 'entity' :
                                $repository=$this->getEntityManager()->getRepository(Utils::deep_array_value('repository', $source, self::$bundlePath . Utils::deep_array_value('query', $source, '')));
                                $filter['data'] = $repository->getFilter(Utils::deep_array_value('options', $source, [])) ;
                                break;
                        }
                    }
                    if(isset($filter['add'])){
                        $start=Utils::deep_array_value('add-start', $filter);
                        $end=Utils::deep_array_value('add-end', $filter);
                        if(is_array($start)){
                            foreach($start as $v){
                                array_unshift($filter['data'], $v);
                            }
                        }
                        if(is_array($end)){
                            foreach($end as $v){
                                array_push($filter['data'], $v);
                            }
                        }
                    }
                    if (isset($filter['setValue'])) {
                        $filter['d']['def-value'] = $this->getSettingValue($filter['setValue']['query']);
                    }
                }
                $fs[] = $filter;
            }
        }
        $default = [
            'name' => $en,
            'en' => $en,
            'ecn' => $ens['className'],            
            'filters' => $fs,
            'd' => [
                'options' => json_encode(['hiddenFilters' => $hfs])
            ],
            'attr' => ['id' => $id]
        ];
        return array_replace_recursive($default, $options);
    }

    protected function genToolbar($entityClassName = null, $toolsType = 'index', $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $en = $ens['name'];
        $buttons = $this->controllerFunction($ens['controller'], 'getToolbarBtn', [ $toolsType, $options ]);
        if (count($buttons) == 0) {
            return null;
        }
        for ($i = 0, $ien = count($buttons); $i < $ien; $i++) {
            $buttons[$i]['type'] = 'btn';
            if (Utils::deep_array_value('modal', $buttons[$i])){
                $buttons[$i]['routeParam']['type'] = 'm';
            }
            if(!Utils::deep_array_key_exists('attr-href', $buttons[$i])){
                $buttons[$i]['attr']['href'] = $this->getUrl($buttons[$i]['action'], $ens, Utils::deep_array_value('isClient', $buttons[$i]), Utils::deep_array_value('routeParam', $buttons[$i], []));
            }
            Utils::deep_array_value_set('d-url', $buttons[$i], $buttons[$i]['attr']['href']);
            if (Utils::deep_array_value('tmpl', $options)) {
                $buttons[$i]['d']['url-tmpl'] = $buttons[$i]['attr']['href'];
            }
        }
        $default = [
            'name' => $en,
            'en' => $en,
            'ecn' => $ens['className'],
            'template' => null,
            'elements' => $buttons,
            'attr' => [
                'id' => $en . '_toolbar',
                'class' => 'toolbar'
            ]
        ];
        return array_replace_recursive($default, $options);
    }

    protected function genTable($entityClassName = null, $tableType = 'index', $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $en = $ens['name'];
        $default = [
            'name' => $en,
            'en' => $en,
            'ecn' => $ens['className'],
            'attr' => [
                'id' => $en . '_table'
            ],
            'd' => [
                'ajax' => [
                    'url' => $this->getUrl('ajax', $ens),
                    'dataSrc' => ''
                ],
                'order' => [],
                'entity-urls' => [
                    'data' => $this->getUrl('data', $ens, false, ['id' => '__id__'])
                ]
            ]
        ];
        $entitySettings=$this->getEntitySettings($ens);
        $entityTableOptions=array_replace_recursive([
                "columns" => [
                    [ "data" => "id"]
                ]
            ],
            Utils::deep_array_value('tables-options', $entitySettings, [] )
        );
        $tableOptions=$this->tableSettingsFromBase( $ens, $tableType);
        $settings = array_replace($entityTableOptions, is_array($tableOptions) ? $tableOptions : [] );
        $columns = &$settings['columns'];
        $actions = Utils::deep_array_value('actions', $options);
        if ($actions) {
            $actionsList = $this->controllerFunction($ens['controller'], 'getActions', [ $actions ]);
            $ac = $this->genActions($ens, $actionsList);
            $columns[] = array_replace_recursive(
                [
                    'label' => 'actions',
                    'data' => null,
                    'className' => 'dt-actions',
                    'searchable' => false,
                    'orderable' => false,
                    'tmpl' => $ac['tmpl'],
                    'render' => 'actions'
                ],
                Utils::deep_array_value('column', $actions, [])
            );
            $default['d']['entity-urls'] = array_merge($default['d']['entity-urls'], $ac['urls']);
            if (array_key_exists('copy', $actionsList)) {
                $this->addExpModal($ens);
                $default['d']['copy-textarea'] = '#' . $en . '_exp_copy';
            }
            if (array_key_exists('show', $actionsList)) {
                $this->addShowModal($ens);
                $default['d']['show-modal'] = '#' . $en . '_show_modal';
            }
        }
        $select = Utils::deep_array_value('select', $options);
        if ($select) {
            if (!is_array($select)) {
                $select = is_string($select) ? ['options' => ['style' => $select]] : [];
            }
            $selectOptions = Utils::deep_array_value('options-style', $select, 'single');
            if (\is_string($selectOptions)) {
                $selectOptions = ['style' => $selectOptions];
            }
            Utils::deep_array_value_set('selector', $selectOptions, 'tr');
            if (array_key_exists('column', $select)) {
                $selectColumn = array_replace_recursive(
                    [
                        'data' => 'sel',
                        'className' => 'dt-select',
                        'searchable' => false,
                        'orderable' => false,
                        'defaultContent' => "",
                        'render' => "sel"
                    ],
                    is_array($select['column']) ? $select['column'] : []
                );
                if ($selectOptions['selector'] == 'td') {
                    $selectOptions['selector'] = 'td.' . $selectColumn['className'];
                }
                \array_unshift($columns, $selectColumn);
            }
            $default['d']['select'] = $selectOptions;
        }
        $details = Utils::deep_array_value('details', $options);
        if ($details) {
            if (!is_array($details)) {
                $details = is_string($details) ? ['options' => ['render' => $details]] : [];
            }
            $detailOptions = Utils::deep_array_value('options', $details, $en);
            if (is_string($detailOptions)) {
                $detailOptions = ['render' => $detailOptions];
            }
            $column = Utils::deep_array_value('column', $details, true);
            if ($column) {
                array_unshift($columns, array_replace_recursive(
                    [
                        'label' => 'det',
                        'data' => null,
                        'className' => 'dt-detail',
                        'searchable' => false,
                        'orderable' => false,
                        'defaultContent' => ""
                    ],
                    is_array($column) ? $column : []
                ));
            }
            $default['d']['details'] = $detailOptions;
            $default['d']['ajax']['url'] = $this->getUrl('ajax_details', $ens);

        }
        return array_replace_recursive($default, ['d' => $settings], $options);
    }

    protected function genPanel($entityClassName = null, $options = [])
    {
        $ens = $this->getEntityNameSpaces($entityClassName);
        $en = $ens['name'];
        $default = [
            'name' => $en,
            'en' => $en,
            'ecn' => $ens['className'],
            'attr' => [
                'id' => $en . '_panel',
            ]
        ];
        return array_replace_recursive($default, $options);
    }

// </editor-fold>
// <editor-fold defaultstate="collapsed" desc="Messages">
    public function responseMessage($msg, $entityClassName = null, $translate = true, $data=[])
    {
        Utils::deep_array_value_set('type', $msg, 'info');
        if ($translate) {
            $label = Utils::deep_array_value('label', $msg);
            $msg['label'] = $this->trans($this->labelText($label, $entityClassName));
            $msg['title'] = $this->trans($this->titleText(Utils::deep_array_value('title', $msg), $entityClassName));
            $message=Utils::deep_array_value('message', $msg, $label);
            if(is_array($message)){
                $msg['message']=[];
                foreach($message as $m){
                    $msg['message'][] = $this->trans($this->messageText($m, $entityClassName), $data);
                }
            }else{
                $msg['message'] = $this->trans($this->messageText($message, $entityClassName), $data);
            }
        }
        return $msg;
    }

    protected function customMessages(&$messages, $type){
        return $messages;
    }

    protected function getMessageData( $type, $dataReturn=[]){
        $data=[];
        switch ($type){
            case 'add':
                $data=[$dataReturn['added'], $dataReturn['count']];
            break;
            default:
                if($this->entity){
                    $data=$this->entity->getMessageData($type, $dataReturn);
                }
        }
        return $data;
    }

    public function errorMessage($msg, $entityClassName = null, $translate = true){
        $msg['type']='error';
        return $this->responseMessage($msg, $entityClassName, $translate);
    }

    private function getFormErrorsMessages(){
        $errors=$this->formSystem ? $this->formSystem->getErrors(true) : [];
        if(count($errors)){
            $messages=$this->errorMessage([ 'title' => 'error.form' ], '');
            $messages['childs']=[];
            foreach ($errors as $key => $error) {
                $messages['childs'][] = $this->errorMessage([
                    'label' =>  $this->trans($this->labelText($error->getOrigin()->getConfig()->getOption('label'), null )),
                    'message' => $error->getMessage()
                ], null, false);
            }
            return $messages;
        }
        return null;
    }

// </editor-fold>
    
// <editor-fold defaultstate="collapsed" desc="Response">
    
    public function JsonResponse($dataReturn = [], $success = true)
    {
        return new JsonResponse($dataReturn, $success ? 200 : 400);
    }

    public function saveManyToBaseJson($entities, $type, $dataReturn = [])
    {
        try {
            $this->getEntityManager()->flush();
            $msg=$this->responseMessage([
                'title' => $type,
                'message' => $type,
                'type' => 'success'
            ], null, true, $this->getMessageData($type, $dataReturn));
            $dataReturn = array_merge_recursive(
                $dataReturn, 
                [
                    "messages" => $this->customMessages($msg, $type),
                    "entities" => []
                ]);

            foreach($entities as $entity){
                $dataReturn['entities'][]=$entity->getSuccessData($type);
            }
            return new JsonResponse($dataReturn, 200);
        } catch (\Doctrine\ORM\ORMException $e) {
            return $this->errorJsonResponse('base', $e->getMessage());
        } catch (\Exception $e) {
            return $this->errorJsonResponse('server', $e->getMessage());
        }
    }

    public function saveToBaseJson($type, $dataReturn = [])
    {
        try {
            $this->getEntityManager()->flush();
            if ($this->entity ) {
                $this->entityId = $this->entity->getId();
                $msg=$this->responseMessage([
                    'title' => $type,
                    'message' => $type,
                    'type' => 'success'
                ], null, true, $this->getMessageData($type, $dataReturn));

                $dataReturn = array_merge_recursive(
                    $dataReturn, 
                    [
                        "id" => $this->entityId,
                        "messages" => $this->customMessages($msg, $type)
                    ],
                    $this->entity->getSuccessData($type)
                );
                $fnPost='post'.\ucfirst($type).'Action';
                if (method_exists($this, $fnPost)) {
                    $this->$fnPost($dataReturn);
                }
                if ($this->entityId) {
                    $dataReturn['edit_param'] = [
                        'title' => $this->trans($this->titleText('edit')),
                        'urls' => [
                            'site' => $this->getUrl('edit'),
                            'form' => $this->getUrl('update')
                        ],
                        'submit' => [
                            'label' => $this->trans($this->labelText('update', '')),
                            'title' => $this->trans($this->titleText('update', '')),
                        ]
                    ];
                }
            }
            return new JsonResponse($dataReturn, 200);
        } catch (\Doctrine\ORM\ORMException $e) {
            return $this->errorJsonResponse('base', $e->getMessage());
        } catch (\Exception $e) {
            return $this->errorJsonResponse('server', $e->getMessage());
        }
    }

    public function responseSave($type, $dataReturn=[], $command="persist"){
        if (is_null($dataReturn) || (is_array($dataReturn) && !array_key_exists('errors', $dataReturn))) {
            $this->getEntityManager()->$command($this->entity);
            return $this->saveToBaseJson($type, $dataReturn);
        }
        return $this->errorsJsonResponse($type,  $dataReturn);
    }

    public function responseSaveMany($entities, $type, $dataReturn=[], $command="persist"){
        if (is_null($dataReturn) || (is_array($dataReturn) && !array_key_exists('errors', $dataReturn))) {
            $dataReturn['added'] = 0;
            Utils::deep_array_value_set('count', $dataReturn, $entities->count());
            foreach($entities as $entity){
                $this->getEntityManager()->$command($entity);
                $dataReturn['added']++;
            }

            return $this->saveManyToBaseJson($entities, $type, $dataReturn);
        }
        return $this->errorsJsonResponse($type,  $dataReturn);
    }

    public function errorJsonResponse($type='', $messageStr = '', $entityClassName='', $translate=false)
    {
        $msg=$this->errorMessage([ 'title' => 'error.'.$type ], $entityClassName, true);
        $msg['message']= $translate ? $this->trans($this->messageText($messageStr, $entityClassName)) : $messageStr;
        return new JsonResponse( ['errors' => $msg ], 400 );
    }

    public function responseMustAjax()
    {
        return $this->errorJsonResponse('server', 'must_ajax', '', true);
    }

    public function responseAccessDenied($ajax=false)
    {
        throw $this->createAccessDeniedException();
        if($ajax){
            return $this->errorJsonResponse('server', 'access_denied', '', true);
        }
        $this->setTemplate('accessDenied');
        $this->setRenderOptions([
            'title' => $this->titleText('error.system', '')
        ]);
        return $this->renderSystem();
    }

    public function errorsJsonResponse($type, $dataReturn = [])
    {
        if(is_array($formErrors=$this->getFormErrorsMessages())){
            if(!is_array(Utils::deep_array_value('errors-childs', $dataReturn))){
                $dataReturn['errors']['childs']=[];
            }
            $dataReturn['errors']['childs'][]=$formErrors;
        }
        if($this->formSystem){
        if (is_object($this->entity)) {
            $this->renderOptions['entity'] = $this->entity;
        }
        $this->renderOptions['form'] = $this->formSystem->createView();
        $dataReturn['form_body'] = $this->renderView($this->renderOptions['template_body'], $this->renderOptions);
        }
        return new JsonResponse(array_merge_recursive([ 
                'errors' => $this->errorMessage([ 'title' => 'error.'.$type])
            ],
            $dataReturn
        ), 400);
    }

// </editor-fold>


    public static function genFilter($type = 'index', $options = [])
    {
        $id = Utils::deep_array_value('id', $options);
        $cid = Utils::deep_array_value('cid', $options);
        $isClient=$cid != null;
        switch($type){
            case 'client_hidden':
                return [
                    'name' => 'client',
                    'type' => 'hidden',
                    'value' => $isClient ? [ $cid ] : [],
                ];
            break;
            case 'clients_hidden':
                return [
                    'name' => 'clients',
                    'type' => 'hidden',
                    'value' => $isClient ? [ $cid ] : [],
                ];
            break;
        }
        return null;
    }

    public static function getFilters($type = 'index', $options = [])
    {
        $filters = [
            static::$activeFilter
        ];
        return $filters;
    }

    public static function addFilter(&$filters, $filter, $index=null)
    {
        if(is_array($filter)){
            if(isset($index)){
                if( !Utils::deep_array_value_check('type', $filter, 'hidden') ){
                    Utils::deep_array_value_set('label', $filter, self::filterLabel($index, static::en));
                    Utils::deep_array_value_set('attr-title', $filter, self::filterTitle($index, static::en));
                }
                $filters[$index]=$filter;
            }else{
                $filters[]=$filter;
            }
        }
        return $filters;
    }

    public static function getActions($type = 'index', $options=[])
    {
        $actions = [
            ['action' => 'edit', 'type' => 'm', 'target' => static::en],
            ['action' => 'delete', 'type' => 'm', 'target' => static::en]
        ];
        return $actions;
    }

    public static function getToolbarBtn($type='index', $options=[] )
    {
        return [
            [
                'action' => 'new',
                'modal' => static::en,
                'attr' => ['class' => 'btn-primary']
            ]
        ];
    }


}
